import { spawn } from "child_process"

async function getModelPi() {
  return new Promise((resolve) => {
    try {
      const getModel = spawn("cat", ["/proc/cpuinfo"], { uid: 1000, gid: 1000 })
      let retour = null
      getModel.stdout.on("data", (data) => {
        retour += data
      })

      getModel.stderr.on("data", (data) => {
        throw new Error('getModelPi error');
      })

      getModel.on("close", (code) => {
        if (code === 0) {
          retour = retour.replaceAll('\t', '').split('\n')
          const modelPi = retour.find(item => item.includes('Model')).split(':')[1].trim()
          // console.log('model Pi = ', modelPi);
          resolve(modelPi)
        }
      })
    } catch (error) {
      console.log('-> getModelPi,', error);
      resolve('unknown')
    }
  })
}

console.log('-->', await getModelPi())