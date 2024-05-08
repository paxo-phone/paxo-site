/// Constant definitions
const deviceFilters = []

/// Installer related
async function initializeConnection(appid) {
  if (!navigator.serial) {
    throw "WebSerial n'est pas supporté"
  }

  uiSetReport("Accès à l'appareil demandé")

  const device = await navigator.serial.requestPort({ filters: deviceFilters })
    .catch(() => {
      throw "Aucun port n'a été selectionné"
    })

  await device.open({ baudRate: 115200 })

  if (!device.readable || device.readable.locked) {
    throw "Ne peut pas recevoir des données de l'appareil"
  }

  if (!device.writable || device.writable.locked) {
    throw "Ne peut pas envoyer des données à l'appareil"
  }

  return device
}

let latestReadBuf = new Uint8Array(0)
async function readBytesFromReader(reader, n) {
  let remaining = n
  let buftosend = new Uint8Array()

  while (remaining > 0) {
    if (remaining < latestReadBuf.length) {
      buftosend += latestReadBuf.slice(0, remaining)
      latestReadBuf = latestReadBuf.slice(remaining)
      return buftosend
    }
    else {
      buftosend += latestReadBuf
      remaining -= latestReadBuf.length
      let { value: buf, done: streamClosed } = await reader.read()

      if (streamClosed)
        throw "Stream got closed while reading"
      else
        latestReadBuf = buf
    }
  }
}

const encoder = new TextEncoder();
function textToBytes(text) {
  return encoder.encode(text);
}

const inviteMatches = [
  textToBytes(">>>"),
  textToBytes(">!>")
]
async function waitForCommandInvite(reader, writer) {
  let read = readBytesFromReader(reader, 3)
  // while
}

async function startInstallation(appid) {
  const device = await initializeConnection(appid)

  const reader = device.readable.getReader()
  const writer = device.writable.getWriter()
  reader.closed.catch((err) => {
    throw err
  })
  writer.closed.catch((err) => {
    throw err
  })

  return [reader, writer]
}

window.readBytesFromReader = readBytesFromReader
window.startInstallation = startInstallation

/// UI related
const appid_el = document.getElementById('appinstaller-appid');
const report_el = document.getElementById('appinstaller-report');
const launchbtn_el = document.getElementById('appinstaller-launchbtn');
function uiGetAppid() {
  return Number.parseInt(appid_el.value);
}

function uiSetReport(val) {
  console.log("Rapport: " + val);
  report_el.textContent = val;
}

async function launchInstaller() {
  const appid = uiGetAppid()
  if (isNaN(appid) || !isFinite(appid)) {
    uiSetReport("Identifiant d'application invalide")
    return
  }

  uiSetReport("Starting app installation")

  try {
    await startInstallation(appid)
  } catch (error) {
    uiSetReport("Une erreur s'est produite: " + error)
    throw error;
  }

  uiSetReport("Succès de l'installation")
}

launchbtn_el.addEventListener('click', launchInstaller);
