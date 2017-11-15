import * as T from 'three';
import stuff from 'stuff';
import mandelbrotShader from 'shaders/mandelbrot.frag';
import mandelbrotEscapeShader from 'shaders/sampleMandelbrotEscape.frag';
import mandelbrotStepShader from 'shaders/mandelbrotStep.frag';
import MT from 'mersenne-twister';

const BAILOUT = 2;
//GPUs have a limit to their loop.
const MAX_CHUNK = 4000;
const MIN_ITER = 40000;
const MAX_ITER = 70000;

const MIN_HIST_ITER = 800;
const MAX_HIST_ITER = 70000;
const HIST_MAX_WEIGHT = 1e6;
const HIST_W = 2048;
const HIST_H = 2048;
const HIST_ASPECT = HIST_W / HIST_H;
const HIST_TRANSLATE_X = -0.65;
const HIST_TRANSLATE_Y = 0.;
const HIST_SCALE = 1.15
const JITTER = 2 * HIST_SCALE / HIST_W;

//One side of the renderer can't be too huge, so to get around that use a 2D texture to sample.
const N_SAMPLE_ROOT = 256;
const N_SAMPLES = N_SAMPLE_ROOT * N_SAMPLE_ROOT;

const BUDDHABROT_W = 1920;
const BUDDHABROT_H = 1080;
const BUDDHABROT_ASPECT = BUDDHABROT_W / BUDDHABROT_H;
const BUDDHABROT_SCALE = 1.;
const BUDDHABROT_TRANSLATE_X = -0.3;
const BUDDHABROT_PIXEL_SIZE = BUDDHABROT_SCALE / BUDDHABROT_H;
const normalizeColor = c => [(c >> 16) / 255, (c >> 8 & 0xFF) / 255, (c & 0xFF) / 255];
const PALETTE = [
    normalizeColor(0xffffff),
];
let PALETTE_RANGE = [0];
function getMandelbrotHistogram() {
    let mandelbrotHistrCompute = new stuff.gl.ComputeShaderPass({
        uniforms: {
            usePrev: {
                type: 'i',
                value: 0
            },
            scale: {
                type: 'f',
                value: HIST_SCALE,
            },
            aspect: {
                type :'f',
                value: HIST_W / HIST_H
            },
            translate: {
                type: 'v2',
                value: new T.Vector2(HIST_TRANSLATE_X, HIST_TRANSLATE_Y)
            }
        },
        fragmentShader: mandelbrotShader({MAX_ITER: MAX_CHUNK, BAILOUT2: BAILOUT * BAILOUT})
    }, HIST_W, HIST_H, 'prev');

    mandelbrotHistrCompute.execute();
    mandelbrotHistrCompute.material.uniforms.usePrev.value = 1;
    for(let i = MAX_CHUNK; i < MAX_HIST_ITER; i += MAX_CHUNK) {
        mandelbrotHistrCompute.execute();
    }
    let mandelbrotHistr = mandelbrotHistrCompute.getData();

    mandelbrotHistrCompute.dispose();

    return mandelbrotHistr;
}

function getInterestingCoordinates(histogram) {
    let distribution = {};
    let getIndex = (x, y) => {
        if(x < 0 || y < 0 || x >= HIST_W || y >= HIST_H) {
            return -1;
        }
        return 4 * (x + y * HIST_W);
    };

    let cumulativeWeights = 0.;
    //Number of pieces in the piece-wise distribution, will be useful for initializing buffers.
    let nPieces = 0.;
    //For every pixel
    for(let y = 0; y < HIST_H; ++y) {
        for(let x = 0; x < HIST_W; ++x) {
            let index = getIndex(x, y);

            let weight = histogram[index + 2];
            if(histogram[index + 3] == 0. || weight < MIN_HIST_ITER) {
                continue;
            }
            ++nPieces;

            weight = Math.min(weight, HIST_MAX_WEIGHT);
            distribution[index] = [histogram[index], histogram[index + 1], weight];
            cumulativeWeights += weight;
            continue;

            //For the surrounding pixels
            for(let dy = -1; dy <= 1; ++dy) {
                for(let dx = -1; dx <= 1; ++dx) {
                    let dIndex = getIndex(x + dx, y + dy);
                    if(dIndex == -1 || (dy == 0 && dx == 0)
                        || dIndex in distribution
                        || (histogram[dIndex + 3] != 0. && histogram[dIndex + 2] >= MIN_HIST_ITER)
                    ) {
                        continue;
                    }

                    ++nPieces;

                    /* I assign a small sample probability to the surrounding coordinates that were unable to
                     * escape. This is because a pixel takes up a small region, and our sampling (the top left 
                     * of the pixel) may have simply been unlucky (the Mandelbrot shape is complex, no pun 
                     * intended).
                     * TODO: We can update the probability to sample that pixel region using an adaptive
                     * algorithm.
                     */
                    //For unescaped values, we have to calculate the coordinates because the shader returned z rather than c.
                    distribution[dIndex] = [
                        (2 * (x + dx + 0.5) / HIST_W - 1.) * HIST_ASPECT * HIST_SCALE + HIST_TRANSLATE_X,
                        (2 * (y + dy + 0.5) / HIST_H - 1.) * HIST_SCALE + HIST_TRANSLATE_Y,
                        weight * 0.1
                    ];
                    cumulativeWeights += weight * 0.1;
                }
            }
        }
    }

    //Form the CDF.
    let pdf = new Float64Array(nPieces * 4);
    let cdf = new Float64Array(nPieces);
    let pdfSum = 0;
    let i = 0;
    for(let index in distribution) {
        let [x, y, weight] = distribution[index];
        let i4 = i * 4;
        weight /= cumulativeWeights;

        pdf[i4] = x;
        pdf[i4 + 1] = y;
        pdf[i4 + 2] = weight;
        pdf[i4 + 3] = JITTER * JITTER / weight;
        if(i < cdf.length) {
            cdf[i] = pdfSum;
        }
        ++i;
        pdfSum += weight;
    }

    console.log('Bins', nPieces);
    if(i < nPieces) {
        throw `The number of bins, ${nPieces}, is less than the number of items in the distribution ${i}.  
            Duplicate indices may have occured when calculating interesting points because the surrounding pixel test is not mutually exclusive from the normal escape test.`;
    }

    if(pdfSum) {
        console.warn("CDF does not sum to 1:", pdfSum);
    }

    return {pdf, cdf};
}

function dataIndex(buffer, x, y, channels = 4) {
    return (y * buffer.image.width + x) * channels;
}

function coordToIndex(buffer, translate, scale, channels = 4) {
    //Multiplication is faster than division! Wooooo!
    let invScale = 1. / scale;
    let bufImg = buffer.image;

    return function(coord, index) {
        /*Taking the inverse of what we have in the fragment shader:
         *let px = bufImg.width * 0.5 * ((coord[0] - translate[0]) / (scale * bufImg.width / bufImg.height) + 1)
         *let py = bufImg.height * 0.5 * ((coord[1] - translate[1]) / scale + 1)
         *Simplify the above a bit (by multiplying the width into the formula for px):
         */
        let px = 0.5 * (bufImg.height * (coord[index] - translate[0]) * invScale + bufImg.width);
        let py = 0.5 * bufImg.height * ((-coord[index + 1] + translate[1]) * invScale + 1);
        if(px >= bufImg.width || px < 0 || py >= bufImg.height || py < 0) {
            return -1;
        }

        return dataIndex(buffer, Math.floor(px), Math.floor(py), channels);
    };
}

function lowerBound(arr, n) {
    let a = 0,
        b = arr.length;

    while(b - a > 1 && arr[a] < n) {
        let middle = Math.floor((a + b) * 0.5);
        if(arr[middle] <= n) {
            a = middle;
        }
        else {
            b = middle;
        }
    }
    return a;
}

function sampleCoordinates(rng, pdf, cdf, texture) {
    /*
    This will test the lower bound function at various ticks.
    for(var i = 0; i < cdf.length; ++i) {
        let a = cdf[i];
        let b = i == cdf.length - 1 ? cdf[i] + 0.1 : cdf[i + 1]
        for(var j = 0; j < 1; j += 0.15) {
            let n = a + (b - a) * j;
            let index = lowerBound(cdf, n);
            if(index != i) {
                throw `
                    Lower Bound Test error
                    Current CDF: ${a},
                    Next CDF: ${b},
                    Target: ${n},
                    Expected Index: ${i},
                    Result: ${index}
                `;
            }
        }
    }
    return;
    */
    texture.needsUpdate = true;
    let samplesBuf = texture.image.data;
    for(let i = 0; i < 4 * N_SAMPLES; i += 4) {
        let rand = rng.random();
        let a = lowerBound(cdf, rand);
        a *= 4;
        samplesBuf[i] = pdf[a] + rng.random() * JITTER - 0.5 * JITTER;
        samplesBuf[i + 1] = pdf[a + 1] + rng.random() * JITTER - 0.5 * JITTER;
        samplesBuf[i + 2] = a; //Remember the index for the pdf.
    }
}

function visualizeMandelbrotPdf(pdf) {
    let maxPdf = 0;
    let maxInvPdf = 0.;
    let dataImgBuffer = new T.DataTexture(new Float32Array(3 * HIST_W * HIST_H), HIST_W, HIST_H, T.RGBFormat, T.FloatType);
    dataImgBuffer.needsUpdate = true;
    let pdfToPixel = coordToIndex(
        dataImgBuffer,
        [HIST_TRANSLATE_X, HIST_TRANSLATE_Y],
        HIST_SCALE,
        3
    );

    for(let index = 0; index < pdf.length; index += 4) {
        let imgIndex = pdfToPixel(pdf, index);
        if(imgIndex == -1) {
            continue;
        }
        maxPdf = Math.max(maxPdf, pdf[index + 2]);
        dataImgBuffer.image.data[imgIndex] = pdf[index + 2];
        dataImgBuffer.image.data[imgIndex + 1] = pdf[index + 2];
        dataImgBuffer.image.data[imgIndex + 2] = pdf[index + 2];
    }

    let pdfTexViewer = new stuff.gl.ComputeShaderPass({
        uniforms: {
            dataImage: {
                type: 't',
                value: dataImgBuffer
            }
        },
        fragmentShader: `
            varying vec2 vUv;
            uniform sampler2D dataImage;
            void main() {
                vec3 color = texture2D(dataImage, vUv).xyz;
                gl_FragColor = vec4(20. * color / ${maxPdf}, 1.);
            }
        `
    }, HIST_W, HIST_H);

    let pdfRenderer = new T.WebGLRenderer({ canvas: document.getElementById('view') });
    pdfRenderer.setClearColor(0, 1);
    pdfRenderer.autoClear = false;
    pdfRenderer.setSize(HIST_W, HIST_H);
    pdfRenderer.render(pdfTexViewer.scene, pdfTexViewer.camera);
}

export default function() {
    //Piecewise uniform probability distribution function generated by sampling the Mandelbrot equation.
    let {pdf, cdf} = getInterestingCoordinates(getMandelbrotHistogram());
    //visualizeMandelbrotPdf(pdf);
    //return;


    //I really wish I could use CMWC, but that requires uint64 and I'm not taking any chances!
    let rng = new stuff.MT();

    //Used for random sampling.
    let escapeTestSamplesTex = new T.DataTexture(new Float32Array(4 * N_SAMPLES), N_SAMPLE_ROOT, N_SAMPLE_ROOT, T.RGBAFormat, T.FloatType);
    //Get escape values in bulk first.
    let escapeTestCompute = new stuff.gl.ComputeShaderPass({
        uniforms: {
            usePrev: {
                type: 'i',
                value: 0
            },
            samples: {
                type: 't',
                value: escapeTestSamplesTex
            }
        },
        fragmentShader: mandelbrotEscapeShader({MAX_CHUNK, BAILOUT2: BAILOUT * BAILOUT})
    }, N_SAMPLE_ROOT, N_SAMPLE_ROOT, 'prev');
    //Used to hold the results for the escape compute.
    let escapeTestResultsBuf = new Float32Array(4 * N_SAMPLES);
    function sampleAndTestEscape() {
        sampleCoordinates(rng, pdf, cdf, escapeTestSamplesTex);
        escapeTestCompute.material.uniforms.usePrev.value = 0;
        escapeTestCompute.execute();
        escapeTestCompute.material.uniforms.usePrev.value = 1;
        for(let i = MAX_CHUNK; i < MAX_ITER; i += MAX_CHUNK) {
            escapeTestCompute.execute();
        }
        escapeTestCompute.getData(0, 0, null, null, escapeTestResultsBuf);
    }

    //Give up on bailout computations more quickly because at this point, the location may be out of the screen and won't be drawn!
    let escapedSamplesTex = new T.DataTexture(new Float32Array(4 * 28 * 28), 28, 28, T.RGBAFormat, T.FloatType);
    //Run in a step-wise fashion, collecting the escaped coordinates.
    let stepCompute = new stuff.gl.ComputeShaderPass({
        uniforms: {
            samples: {
                type: 't',
                value: escapedSamplesTex
            },
            clear: {
                type: 'i',
                value: 1
            }
        },
        fragmentShader: mandelbrotStepShader({MAX_ITER, BAILOUT2: 4})
    }, 28, 28, 'prev');
    //Used to hold the results at each step of the computation. 
    let stepBuf = new Float32Array(4 * 28 * 28);
    let buddhabrotHistogram = new T.DataTexture(new Float32Array(4 * BUDDHABROT_W * BUDDHABROT_H), BUDDHABROT_W, BUDDHABROT_H, T.RGBAFormat, T.FloatType);
    let toIdx = coordToIndex(buddhabrotHistogram, [BUDDHABROT_TRANSLATE_X, 0], BUDDHABROT_SCALE, 4);

    function gatherEscapedCoordinates() {
        let nEscaped = 0;
        let maxEscape = 0;
        let escapeTestSamples = escapeTestSamplesTex.image.data;
        let escapedSamples = escapedSamplesTex.image.data;
        for(let i = 0; i < escapeTestResultsBuf.length; i += 4) {
            if(escapeTestResultsBuf[i] && escapeTestResultsBuf[i + 1] >= MIN_ITER) {
                escapedSamples[nEscaped] = escapeTestSamples[i];
                escapedSamples[nEscaped + 1] = escapeTestSamples[i + 1];
                escapedSamples[nEscaped + 2] = escapeTestSamples[i + 2];
                //The color
                escapedSamples[nEscaped + 3] = lowerBound(PALETTE_RANGE, escapeTestResultsBuf[i + 1]) % PALETTE.length;
                maxEscape = Math.max(maxEscape, escapeTestResultsBuf[i + 1]);
                nEscaped += 4;
                if(nEscaped >= escapedSamples.length) {
                    break;
                }
            }
        }
        //Use -1 as a signal to the GPU that this sample did not escape.
        for(let i = nEscaped; i < escapedSamples.length; i += 4) {
            escapedSamples[i + 2] = -1;
        }
        escapedSamplesTex.needsUpdate = true;
        return { nEscaped, maxEscape };
    }
    let maxHist = 1;
    function accumulate() {
        //Execute this first, in case there's some optimization that allows the GPU to run in parallel until it blocks.
        stepCompute.material.uniforms.clear.value = 1;
        stepCompute.execute();

        let {nEscaped, maxEscape} = gatherEscapedCoordinates();
        console.log('Pass', k, 'Max Escape', maxEscape, 'N Escaped', nEscaped);

        if(nEscaped) {
            let histBuf = buddhabrotHistogram.image.data;
            stepCompute.material.uniforms.clear.value = 0;
            for(let i = 0; i <= MAX_ITER; ++i) {
                stepCompute.execute();
                stepCompute.getData(0, 0, null, null, stepBuf);
                if(i < MIN_ITER) {
                    continue;
                }
                for(let j = 0; j < nEscaped; j += 4) {
                    if(stepBuf[j + 3]) {
                        continue;
                    }
                    let histIdx = toIdx(stepBuf, j);
                    if(histIdx < 0 || histIdx >= histBuf.length) {
                        continue;
                    }
                    let color = PALETTE[escapedSamplesTex.image.data[j + 3]];
                    let pdfIdx = escapedSamplesTex.image.data[j + 2];
                    let invWeight = pdf[pdfIdx + 3];
                    histBuf[histIdx] += invWeight * color[0];
                    histBuf[histIdx + 1] += invWeight * color[1];
                    histBuf[histIdx + 2] += invWeight * color[2];
                    //maxHist = Math.max(maxHist, histBuf[histIdx]);
                }
            }
            buddhabrotHistogram.needsUpdate = true;
            //The issue here is that I have no idea what the probability of sampling within our criteria is and I'm not applying an adaptive approach, so this is a quick hack.
            maxHist += (N_SAMPLES / 16384);
        }
    }

    let buddhabrotViewer = new stuff.gl.ComputeShaderPass({
        uniforms: {
            maxHist: {
                type: 'f', 
                value: 1
            },
            histogram: {
                type: 't',
                value: buddhabrotHistogram
            }
        },
        fragmentShader: `
            varying vec2 vUv;
            uniform sampler2D histogram;
            uniform float maxHist;

            void main() {
                vec3 color = texture2D(histogram, vUv).xyz;
                color = clamp(50. * color / maxHist, 0., 1.);
                gl_FragColor = vec4(color, 1.);
            }
        `
    }, BUDDHABROT_W, BUDDHABROT_H, undefined, document.getElementById('view'));

    let k = 0;
    function draw() {
        ++k;
        sampleAndTestEscape();
        accumulate();
        buddhabrotViewer.material.uniforms.maxHist.value = maxHist;
        buddhabrotViewer.execute();
        //We want to continue computing the image in the back.
        setTimeout(draw, 0);
        //requestAnimationFrame(draw);
    }
    draw();

    /* CPU vs GPU sampling for posterity
    //Since we can't use a while loop in a shader, we can hax by hardcoding a value that we believe to be the max depth 
    //needed for our binary search of the cdf.
    let depth = Math.ceil(Math.log2(pdf.length / 4)) + 2;
    console.log(depth)

    let rngNums = new Float32Array(N_SAMPLES);
    for(let i = 0; i < N_SAMPLES; ++i) {
        rngNums[i] = rng.random();
    }
    let cdfLength = pdf.length / 4;
    //Fucking webgl must use power of 2 textures.
    let cdf = new Float32Array(1024 * 1024);
    for(let i = 3; i < pdf.length; i += 4) {
        cdf[(i - 3) / 4] = pdf[i];
    }

    let timer;
    let sampleIndices = new Uint32Array(N_SAMPLES);
    //JS code for benchmarking, to see how fast it is vs GPU.
    for(let _ = 0; _ < 1500; ++_) {
        for(let i = 0; i < N_SAMPLES; ++i) {
            let rand = rngNums[i];

            //Binary search.
            let a = 0, b = pdf.length;
            while(b - a > 1 && cdf[a] < rand) {
                let middle = Math.floor((a + b) / 2);
                if(cdf[middle] <= rand) {
                    a = middle;
                }
                else {
                    b = middle;
                }
            }

            sampleIndices[i] = a;
        }
        if(_ == 1) {
            timer = new Date();
        }
    }
    console.log('Time taken to sample 8192 indices (CPU): ' + (new Date() - timer));

    let cdfTex = {
        type: 't', //Max side-length is probably 16384, so index in a 2D manner.
        value: new T.DataTexture(cdf, 1024, 1024, T.AlphaFormat, T.FloatType)
    };
    let rngTex = {
        type: 't',
        value: new T.DataTexture(rngNums, rngNums.length, 1, T.AlphaFormat, T.FloatType)
    };
    cdfTex.value.needsUpdate = true;
    let binSearchCompute = new stuff.gl.ComputeShaderPass({
        uniforms: {
            cdf: cdfTex,
            rngNums: rngTex
        },
        fragmentShader: `
            precision highp float;

            uniform sampler2D cdf;
            uniform sampler2D rngNums;

            varying vec2 vUv;
            void main() {
                int a = 0;
                int b = ${cdfLength};
                float r = texture2D(rngNums, vUv - vec2(0.5 / 8192., 0.5)).a;

                for(int i = 0; i < ${depth}; ++i) {
                    float xA = float(a - 1024 * (a / 1024)) + 0.5;
                    float yA = float(a / 1024) + 0.5;
                    if(b - a <= 1 || texture2D(cdf, vec2(xA, yA)).a >= r) {
                        break;
                    }

                    int middle = (a + b) / 2;
                    float xM = float(middle - 1024 * (middle / 1024)) + 0.5;
                    float yM = float(middle / 1024) + 0.5;
                    if(texture2D(cdf, vec2(xM, yM)).a <= r) {
                        a = middle;
                    }
                    else {
                        b = middle;
                    }
                }
                gl_FragColor = vec4(float(a));
            }
        `
    }, 8192, 1);
    console.log(cdfLength);

    let dataBufferTest = new Float32Array(4 * 8192);
    for(let _ = 0; _ < 1500; ++_) {
        rngTex.value.needsUpdate = true;
        binSearchCompute.execute();
        let d = binSearchCompute.getData(0, 0, null, null, dataBufferTest);
        if(_ == 1) {
            timer = new Date();
        }
    }
    console.log('Time taken to sample 8192 indices (GPU): ' + (new Date() - timer));
    */
}
