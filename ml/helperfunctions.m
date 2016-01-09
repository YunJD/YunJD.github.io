g = inline('1.0 ./ (1.0 + exp(-z))');
function f = jj(h, x, y)
	f = x' * (h - y) / length(x)
end

function f = hj(h, x)
	f = x' * (h .* (1 - h) .* x) / length(x)
end
