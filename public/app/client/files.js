rufus.controller('filesCtrl', FilesController);

function FilesController($scope, sharedData) {
  const _this = this;
  this.sharedData = sharedData;
  this.file = {};

  db.allDocs({
    include_docs: true,
    startkey: `f-${sharedData.patient._id.substring(2)}`,
    endkey: `f-${sharedData.patient._id.substring(2)}\uffff`,
  }).then((result) => {
    _this.files = [];
    for (let n = 0; n < result.rows.lenght; n += 1) {
      _this.files.push(result.rows[n].doc);
    }
    $scope.$apply();
  }).catch(console.error.bind(console));

  const fileInput = document.getElementById('file-input');
  const preview = document.getElementById('preview');
  fileInput.onchange = () => {
    if (this.files && this.files[0]) {
      [_this.inputFile] = this.files;
      if (_this.inputFile.type.startsWith('image')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          preview.src = e.target.result;
        };
        reader.readAsDataURL(_this.inputFile);
      } else {
        preview.src = '';
      }
    } else {
      _this.inputFile = undefined;
      preview.src = '';
    }
    $scope.$apply();
  };

  this.postFileHandler = (xhr) => {
    if (xhr.status === 204 || xhr.status === 200) {
      db.put(_this.file).then((response) => {
        if (response.ok) {
          _this.files.push(_this.file);
          _this.submitClass = '';
        } else {
          _this.submitClass = 'is-danger';
        }
        $scope.$apply();
      }).catch(console.error.bind(console));
    } else {
      alert(`Upload failed: ${xhr.status} - ${xhr.responseText}`);
      _this.submitClass = 'is-danger';
      $scope.$apply();
    }
  };

  this.submit = () => {
    _this.submitClass = 'is-loading';
    let key = `f-${sharedData.patient._id.substring(2)}-${Date.now()}`;
    let blob;

    if (_this.inputFile.type.startsWith('image')) {
      blob = _this.imgToBlob(preview, 0.5, 'image/webp');
      key += '.webp';
    } else {
      blob = _this.inputFile;
      key += _this.inputFile.name.substring(_this.inputFile.name.lastIndexOf('.'));
    }
    _this.file._id = key;
    sharedData.postFile(blob, 'rufus-files', key, _this.postFileHandler);
  };

  this.imgToBlob = (img, quality, type) => {
    const cvs = document.createElement('canvas');
    cvs.width = img.naturalWidth;
    cvs.height = img.naturalHeight;
    const binStr = atob(cvs.toDataURL(type, quality).split(',')[1]);
    const len = binStr.length;
    const arr = new Uint8Array(len);
    for (let i = 0; i < len; i += 1) {
      arr[i] = binStr.charCodeAt(i);
    }
    return new Blob([arr], { type });
  };

  this.keyToIcon = (key) => {
    switch (key.substring(key.lastIndexOf('.'))) {
      case '.webp':
        return 'file-image-o';
      case '.pdf':
        return 'file-pdf-o';
      case '.docx':
      case '.odt':
      case '.doc':
        return 'file-word-o';
      case '.xlsx':
      case '.ods':
      case '.xls':
        return 'file-excel-o';
      default:
        return '';
    }
  };
  this.keyToDate = (key) => {
    let dateString = key.split('-')[3];
    dateString = dateString.substring(0, dateString.indexOf('.'));
    return new Date(parseInt(dateString, 10));
  };
}
