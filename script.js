const cloudName = "dzygc12dd";
const url = `https://api.cloudinary.com/v1_1/${dzygc12dd}/auto/upload`;
const uploadPreset = "ScanForge";

const textInput = document.getElementById("textInput");
const pdfInput = document.getElementById("pdfInput");
const inputType = document.getElementById("inputType");
const errorDiv = document.getElementById("error");
const qrCodeDiv = document.getElementById("qrcode");
const downloadBtn = document.getElementById("downloadBtn");
const copyBtn = document.getElementById("copyBtn");
const toast = document.getElementById("toast");

inputType.addEventListener("change", () => {
  const type = inputType.value;
  textInput.style.display = type === "text" ? "block" : "none";
  pdfInput.style.display = type === "pdf" ? "block" : "none";
  qrCodeDiv.innerHTML = "";
  errorDiv.innerText = "";
  downloadBtn.style.display = "none";
  copyBtn.style.display = "none";
});

function showToast(msg) {
  toast.innerText = msg;
  toast.className = "show";
  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 3000);
}

function generateQRCode() {
  errorDiv.innerText = "";
  qrCodeDiv.innerHTML = "";
  downloadBtn.style.display = "none";
  copyBtn.style.display = "none";

  const type = inputType.value;

  if (type === "text") {
    const text = textInput.value.trim();
    if (!text) {
      errorDiv.innerText = "Please enter some text.";
      return;
    }
    makeQR(text);
  } else if (type === "pdf") {
    const file = pdfInput.files[0];
    if (!file || file.type !== "application/pdf") {
      errorDiv.innerText = "Please upload a valid PDF.";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.secure_url) {
          makeQR(data.secure_url);
        } else {
          errorDiv.innerText = "Upload failed.";
        }
      })
      .catch(() => {
        errorDiv.innerText = "An error occurred during upload.";
      });
  }
}

function makeQR(data) {
  const qr = new QRCode(qrCodeDiv, {
    text: data,
    width: 200,
    height: 200
  });

  setTimeout(() => {
    const qrImg = qrCodeDiv.querySelector("img") || qrCodeDiv.querySelector("canvas");
    if (qrImg) {
      const dataUrl = qrImg.src || qrImg.toDataURL("image/png");
      downloadBtn.href = dataUrl;
      downloadBtn.style.display = "inline-block";
      copyBtn.setAttribute("data-copy", data);
      copyBtn.style.display = "block";
    }
  }, 300);
}

function copyToClipboard() {
  const text = copyBtn.getAttribute("data-copy");
  navigator.clipboard.writeText(text)
    .then(() => showToast("Copied to clipboard!"))
    .catch(() => showToast("Failed to copy."));
}

// Tabs
document.getElementById("generateTabBtn").onclick = () => {
  document.getElementById("generateTab").classList.add("active-tab");
  document.getElementById("scanTab").classList.remove("active-tab");
};

document.getElementById("scanTabBtn").onclick = () => {
  document.getElementById("generateTab").classList.remove("active-tab");
  document.getElementById("scanTab").classList.add("active-tab");
  startScanner();
};

// Dark mode
document.getElementById("themeToggle").addEventListener("change", (e) => {
  document.body.classList.toggle("dark-mode", e.target.checked);
});

// QR SCANNER
let scanner;
function startScanner() {
  const resultDiv = document.getElementById("scanResult");
  const errorDiv = document.getElementById("cameraError");

  if (scanner) {
    return;
  }

  scanner = new Html5Qrcode("preview");
  Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length) {
      scanner.start(
        devices[0].id,
        { fps: 10, qrbox: 250 },
        qrCodeMessage => {
          resultDiv.innerHTML = `<p>Scanned: <a href="${qrCodeMessage}" target="_blank">${qrCodeMessage}</a></p>`;
          scanner.stop();
          scanner.clear();
          scanner = null;
        },
        error => {
          console.log("Scan error:", error);
        }
      );
    } else {
      errorDiv.innerText = "No camera found.";
    }
  }).catch(err => {
    errorDiv.innerText = "Camera access denied.";
  });
}
