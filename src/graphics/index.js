import {MDCSnackbar} from '@material/snackbar';
import * as gl from 'stuff/gl';
import MT from 'stuff/mt.jsx';
export default {
    MT,
    gl,
    mdc: {
        init: function() {
            window.mdc.autoInit();
            this.snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));
        }
    }
};
