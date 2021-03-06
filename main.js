/*******************************************************************************
 * Copyright (c) 2018-2019 Maxprograms.
 *
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 1.0
 * which accompanies this distribution, and is available at
 * https://www.eclipse.org/org/documents/epl-v10.html
 *
 * Contributors:
 *     Maxprograms - initial API and implementation
 *******************************************************************************/ 
const {ipcRenderer, shell} = require('electron');
const {dialog} = require('electron').remote;

document.getElementById('browseSource').addEventListener('click', () => {
    ipcRenderer.send('select-source-file');
});

document.getElementById('browseXLIFF').addEventListener('click', () => {
    ipcRenderer.send('select-xliff-file');
});

document.getElementById('browseTarget').addEventListener('click', () => {
    ipcRenderer.send('select-target-file');
});

document.getElementById('createButton').addEventListener('click', () => {
    var sourceFile = document.getElementById('sourceFile').value;
    if (!sourceFile) {
        dialog.showErrorBox('Attention','Select source file');
        return;
    }
    var sourceLang = document.getElementById('sourceSelect').value;
    if (sourceLang === 'none') {
        dialog.showErrorBox('Attention','Select source language');
        return;
    }
    var fileType = document.getElementById('typeSelect').value;
    if (fileType === 'none') {
        dialog.showErrorBox('Attention','Select file type');
        return;
    }
    var charset = document.getElementById('charsetSelect').value;
    if (charset === 'none') {
        dialog.showErrorBox('Attention','Select character set');
        return;
    }
    var args = {command: 'convert', file: sourceFile, srcLang: sourceLang, type: fileType, enc: charset};
    // check optional parameters
    var targetLang = document.getElementById('targetSelect').value;
    if (targetLang !== 'none') {
        args.tgtLang = targetLang;
    }
    var is20 = document.getElementById('is20').checked;
    if (is20 ) {
        args.is20 = true;
    }
    var isParagraph = document.getElementById('isParagraph').checked;
    if (isParagraph ) {
        args.paragraph = true;
    }
    var isEmbed = document.getElementById('isEmbed').checked;
    if (isEmbed ) {
        args.embed = true;
    }
    ipcRenderer.send('convert', args);
});

document.getElementById('browseXLIFFValidation').addEventListener('click', () => {
    ipcRenderer.send('select-xliff-validation');
});

document.getElementById('validateButton').addEventListener('click', () => {
    var xliffFile = document.getElementById('xliffFileValidation').value;
    if (!xliffFile) {
        dialog.showErrorBox('Attention','Select XLIFF file');
        return;
    }
    var args = {command: 'validateXliff', file: xliffFile};
    ipcRenderer.send('validate', args);
});

document.getElementById('browseXLIFFAnalysis').addEventListener('click', () => {
    ipcRenderer.send('select-xliff-analysis');
});

document.getElementById('analyseButton').addEventListener('click', () => {
    var xliffFile = document.getElementById('xliffFileAnalysis').value;
    if (!xliffFile) {
        dialog.showErrorBox('Attention','Select XLIFF file');
        return;
    }
    var args = {command: 'analyseXliff', file: xliffFile};
    ipcRenderer.send('analyse', args);
});

ipcRenderer.send('get-languages');
ipcRenderer.send('get-types');
ipcRenderer.send('get-charsets');

ipcRenderer.on('add-source-file', (event,arg) => {
    document.getElementById('sourceFile').value = arg.file;
    var type = arg.type;
    if (type !== 'Unknown') {
        document.getElementById('typeSelect').value = type;
    }
    var encoding = arg.encoding;
    if (encoding !== 'Unknown') {
        document.getElementById('charsetSelect').value = encoding;
    }
});

ipcRenderer.on('add-xliff-file', (event,arg) => {
   document.getElementById('xliffFile').value = arg;
});

ipcRenderer.on('add-xliff-validation', (event,arg) => {
    document.getElementById('xliffFileValidation').value = arg;
});

ipcRenderer.on('add-xliff-analysis', (event,arg) => {
    document.getElementById('xliffFileAnalysis').value = arg;
});

ipcRenderer.on('add-target-file', (event,arg) => {
    document.getElementById('targetFile').value = arg;
});

ipcRenderer.on('languages-received', (event,arg) => {
   var array =arg.languages;
   var options = '<option value="none">Select Language</option>';
   for (let i=0 ; i<array.length ; i++) {
       var lang = array[i];
       options = options + '<option value="' + lang.code + '">' + lang.description + '</option>';
   }
   document.getElementById('sourceSelect').innerHTML = options;
   document.getElementById('targetSelect').innerHTML = options;
});

ipcRenderer.on('charsets-received', (event,arg) => {
    var array =arg.charsets;
    var options = '<option value="none">Select Character Set</option>';
    for (let i=0 ; i<array.length ; i++) {
        var charset = array[i];
        options = options + '<option value="' + charset.code + '">' + charset.description + '</option>';
    }
    document.getElementById('charsetSelect').innerHTML = options;
 });
 
 ipcRenderer.on('types-received', (event,arg) => {
    var array =arg.types;
    var options = '<option value="none">Select File Type</option>';
    for (let i=0 ; i<array.length ; i++) {
        var type = array[i];
        options = options + '<option value="' + type.type + '">' + type.description + '</option>';
    }
    document.getElementById('typeSelect').innerHTML = options;
 });
 
ipcRenderer.on('process-created', (event, arg) => {
    document.getElementById('process').innerHTML = '<img src="img/working.gif"/>';
}); 

ipcRenderer.on('validation-started', (event, arg) => {
    document.getElementById('validation').innerHTML = '<img src="img/working.gif"/>';
}); 

ipcRenderer.on('validation-completed', (event, arg) => {
    document.getElementById('validation').innerHTML = '';
}); 

ipcRenderer.on('analysis-started', (event, arg) => {
    document.getElementById('analysis').innerHTML = '<img src="img/working.gif"/>';
}); 

ipcRenderer.on('analysis-completed', (event, arg) => {
    document.getElementById('analysis').innerHTML = '';
    dialog.showMessageBox({type:'info', title:'Success', message: 'Analysis completed'});
    shell.openItem(document.getElementById('xliffFileAnalysis').value + '.log.html');
}); 

ipcRenderer.on('validation-result', (event, arg) => {
    if (arg.valid) {
        dialog.showMessageBox({type:'info', message: arg.comment});
    } else {
        dialog.showMessageBox({type:'error', message: arg.reason});
    }
});

ipcRenderer.on('process-completed', (event, arg) => {
    document.getElementById('process').innerHTML = '';
    dialog.showMessageBox({type:'info', title:'Success', message: 'XLIFF file created'});
}); 

ipcRenderer.on('merge-created', (event, arg) => {
    document.getElementById('merge').innerHTML = '<img src="img/working.gif"/>';
}); 

ipcRenderer.on('merge-completed', (event, arg) => {
    document.getElementById('merge').innerHTML = '';
    dialog.showMessageBox({type:'info', title:'Success',message: 'XLIFF file merged'});
}); 

ipcRenderer.on('show-error', (event, arg) => {
    document.getElementById('process').innerHTML = '';
    document.getElementById('merge').innerHTML = '';
    document.getElementById('validation').innerHTML = '';
    dialog.showMessageBox({type:'error', message: arg});
}); 

document.getElementById('mergeButton').addEventListener('click', () => {
    var xliffFile = document.getElementById('xliffFile').value;
    if (!xliffFile) {
        dialog.showErrorBox('Attention','Select XLIFF file');
        return;
    }
    var targetFile = document.getElementById('targetFile').value;
    if (!targetFile) {
        dialog.showErrorBox('Attention','Select target file/folder');
        return;
    }
    args = {command: 'merge', xliff: xliffFile, target: targetFile};
    var unapproved = document.getElementById('unapproved').checked;
    if (unapproved ) {
        args.unapproved = true;
    }
    ipcRenderer.send('merge', args);
});

document.getElementById('about').addEventListener('click', () => {
    ipcRenderer.send('show-about');
});

document.getElementById('help').addEventListener('click', () => {
    var help = __dirname + '/xliffmanager.pdf';
    if (process.platform == 'win32') {
        __dirname + '\\xliffmanager.pdf'
    }
    shell.openItem(help);
});
