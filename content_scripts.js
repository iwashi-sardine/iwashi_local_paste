let pasteArea = document.querySelector("#ftxa"),
    form = document.querySelector("#ftbl"),
    input = document.querySelector("#ftbl input[type=file][name=upfile]"),
    execPasteElement = null,
    mo = null;

function setFile(file) {
  const dt = new ClipboardEvent('').clipboardData; // XXX: workaround
  dt.items.add(file);

  input.files = dt.files;
}

async function pasteLocal(){
  let child = execPasteElement.childNodes[0];
  if (!child) { // NOTE: case of pasting webm etc.
    // console.log("can't paste local file");
    return;
  }

  let blob = await fetch(child.src).then(r => r.blob());
  let ext = "." + blob.type.split("/")[1].replace("jpeg", "jpg");

  execPasteElement.innerHTML = ""; // NOTE: calls pasteLocal

  const file = new File([blob], 'pasteFromLocalFile' + ext, {type: blob.type});
  setFile(file);
}

function tryPasteFromLocalFile(){
  form.appendChild(execPasteElement);
  execPasteElement.select();
  // execPasteElement.focus({preventScroll: true});
  if (!document.execCommand("paste")) {
    console.error("try paste failed.");
  }
  pasteArea.focus();
  form.removeChild(execPasteElement);
}

function pasteListener(e) {
  for (let item of e.clipboardData.items) {
    const type = item.type;
    if (type.startsWith("text/plain") || type.startsWith("image/")) {
      return;
      // NOTE: いわし本体で行う
    }
  }

  tryPasteFromLocalFile();
}

function main(){
  if(pasteArea == null || input == null) return;

  // create paste target element
  execPasteElement = document.createElement("textarea");
  execPasteElement.setAttribute("contenteditable", "");
  execPasteElement.style.opacity = 0;

  pasteArea.addEventListener('paste', pasteListener);

  mo = new MutationObserver((mutationRecordArray, mutationObserver) => {
    try {
      pasteLocal();
    } catch (e) {
      console.error(e);
    }
  });
  mo.observe(execPasteElement, {childList: true});
}

main();