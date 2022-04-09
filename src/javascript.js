// JRF1@CDC.GOV
// Prototype v0.9 for internal use only
//

//fs = require("fs");
//check if browser supports file api and filereader features
if (window.File && window.FileReader && window.FileList && window.Blob) {
  var myFiles = [];
  var $tw = $tw || Object.create(null);
  const uploadUrl ="http://localhost:3000/upload";
  const chunkSize = 3000000;  // send in 3mb chunks
  const MaxChunks = 75;

  // This function reads a "slice" of the file only rather that the entire file!!
  function readBlob(opt_startByte, opt_stopByte) {
    var files = myFiles;
    //   alert(files.length);
    //   alert(files[0].name);
    if (!files.length) {
      alert("Please open or drag a file first!");
      return;
    }

    var file = files[0];
    var start = parseInt(opt_startByte) || 0;
    var stop = parseInt(opt_stopByte) || file.size - 1;

    var reader = new FileReader();
    // If we use onloadend, we need to check the readyState.
    reader.onloadend = function (evt) {
      if (evt.target.readyState === FileReader.DONE) {
        // DONE == 2
        document.getElementById("byte_content").textContent = evt.target.result;
        document.getElementById("byte_range").textContent = [
          "Read bytes: ",
          start + 1,
          " - ",
          stop + 1,
          " of ",
          file.size,
          " byte file"
        ].join("");
      }
    };

    var blob = file.slice(start, stop + 1);
    reader.readAsBinaryString(blob);
  };
  
  // This handles the user's selection of the desired "slice" of the file (buttons)
  //document.getElementById("readBytesButtons").addEventListener("click",
  document.querySelector(".readBytesButtons").addEventListener("click",
    function (evt) {
      if (evt.target.tagName.toLowerCase() == "button") {
        var startByte = evt.target.getAttribute("data-startbyte");
        var endByte = evt.target.getAttribute("data-endbyte");
        readBlob(startByte, endByte);
      }
    },
    false
  )
  // --------------------------
  // Setup the dnd listeners.
  // --------------------------
  document
    .getElementById("files")
    .addEventListener("change", handleDialogFiles, false);

  var dropZone = document.getElementById("drop_zone");
 
  // Setup the Drag and Drop event listeners.
  // The events "dragenter","dragleave" and "dragover" will add an indicator to let
  // the user know that they have indeed dragged the item over the correct area.
  dropZone.addEventListener("dragenter", highlight, false);
  dropZone.addEventListener("dragleave", unhighlight, false);
  dropZone.addEventListener("dragover", handleDragOver, false);
  // We handle the dropped files in the HandleFileSelect.
  dropZone.addEventListener("drop", handleDroppedFiles, false);


  function handleDroppedFiles(evt) {
    myFiles = evt.dataTransfer.files;
    handleFileSelect(evt);
  }
  function handleDialogFiles(evt) {
    myFiles = evt.target.files;
    handleFileSelect(evt);
  }




  function send(file, size, start, end, numberofChunks, chunkSize, fileId) {
    var formdata = new FormData();
    var xhr = new XMLHttpRequest();

    if (size - end < 0) { 
        end = size;
    }
    if (end < size) {
        xhr.onreadystatechange = function () {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                console.log('Done Sending Chunk');
                send(file, size, start + chunkSize, start + (chunkSize * 2),numberofChunks, chunkSize, fileId )
            }
        }
    } else {
        console.log('Upload complete');
    }

    xhr.open('POST', uploadUrl, true);

    var slicedPart = slice(file, start, end);
    var blockCount = Math.ceil(end / chunkSize); // Total number of slices
    formdata.append('uploadId', fileId);
    formdata.append('chunkIndex', blockCount);  
    formdata.append('totalChunksCount', numberofChunks);
    formdata.append('chunking','true');
    formdata.append('file', slicedPart, file.name);  // <= here goes the file slice

  //  console.log('Sending Chunk for '+fileId+' (Start - End): ' + start + ' ' + end);
    console.log('Sending Chunk for '+fileId+' # ' + blockCount + ' out of ' + numberofChunks );

    xhr.send(formdata);
  }
  function slice(file, start, end) {
    var slice = file.mozSlice ? file.mozSlice :
                file.webkitSlice ? file.webkitSlice :
                file.slice ? file.slice : noop;
    
    return slice.bind(file)(start, end);
  }


  // Here are the event listeners handlers (code).
  // the handleFileSelect() will display the slected file and some metadata
  function handleFileSelect(evt) {
    //event.target.style.border = "none";
    evt.stopPropagation();
    evt.preventDefault();

    var files = myFiles;

   // files is a FileList of File objects. List some properties.
    var output = [], meta = [];
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      output.push(
        "<li><strong>",
        escape(f.name),
        "</strong> (",
        f.type || "n/a",
        ") - ",
        f.size,
        " bytes, last modified: ",
        f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : "n/a",
        "</li>"
      );
            
      var filesize = f.size;
      var numberofChunks = Math.ceil(filesize/chunkSize);
      if( filesize > ( chunkSize * MaxChunks))
           filesize = chunkSize * MaxChunks;
      var numberofChunks = Math.ceil(filesize/chunkSize)+1;
      var start =0; 
      var chunkEnd = start + chunkSize;
      var md5 = CryptoJS.MD5(f.name+((new Date()).getTime())+i);

      //upload the file in chunks
       send(f, filesize, start, chunkEnd, numberofChunks, chunkSize, md5);
    }
    document.getElementById("list").innerHTML =
      "<ul>" + output.join("") + "</ul>";
  }

  function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = "copy"; // Explicitly show this is a copy.
    dropZone.classList.add("highlight");
  }
  function highlight(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    dropZone.classList.add("highlight");
  }
  function unhighlight(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    dropZone.classList.remove("highlight");
  }
 
  // END
} else {
  alert("The File APIs are not fully supported in this browser.");
}


// POPULATE THE ADMINCODES COMBOBOX WITH JSON.
const url = "./data/admincodes.json";
$.getJSON(url, function(admincodes) {
  console.log(admincodes); // this will show the info it in firebug console
  var ele = document.getElementById('admincode');
  for (var i = 0; i < admincodes.length; i++) {
      // POPULATE THE ADMINCODES COMBOBOX WITH JSON.
      ele.innerHTML = ele.innerHTML +
          '<option value="' + admincodes[i]['AdminCode'] + '">' + admincodes[i]['LongName'] + '</option>';
  }
});


/* // Parse a block of name:value fields. The `fields` object is used as the basis for the return value
$tw.utils.parseFields = function(text,fields) {
	fields = fields || Object.create(null);
	text.split(/\r?\n/mg).forEach(function(line) {
		if(line.charAt(0) !== "#") {
			var p = line.indexOf(":");
			if(p !== -1) {
				var field = line.substr(0, p).trim(),
					value = line.substr(p+1).trim();
				if(field) {
					fields[field] = value;
				}
			}
		}
	});
	return fields;
};

*/
// GET CURRENT USER ID  (NOT WORKING !!)
var username="unknown";
try {
  let username = new ActiveXObject("WScript.Network");
} catch {;}
if(username != "unknown")
   alert(username); 
