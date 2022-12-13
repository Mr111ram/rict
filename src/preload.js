// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { ipcRenderer, contextBridge } from 'electron'

ipcRenderer.on('[GET_IMAGE]', (event, image) => {
  const src = `data:image/jpg;base64,${image}`
  localStore.imageSrc = src
})

contextBridge.exposeInMainWorld('electron', {
  chooseImage() {
    return ipcRenderer.invoke('[CHOOSE_IMAGE]')
  },
})
