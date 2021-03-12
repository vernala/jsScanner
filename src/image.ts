import jsQR from "jsqr";
import Jimp from "jimp";

const fileName = `file${new Date().getTime()}`


const getFile = (callback: (data?: any) => void) => {
    let file: HTMLInputElement = document.getElementById(fileName) as HTMLInputElement
    file && file.remove()

    file = document.createElement('input')
    file.id = fileName
    file.style.display = 'none';
    file.type = 'file';
    file.accept = 'image/*'

    document.body.append(file)

    file.addEventListener('change', (e: any) => {
        getImageQrData(e.target.files[0]).then(callback)
    })

    file.click()
}

export const getImageQrData = (file: File) => {
    //const createObjectURL = window.createObjectURL || window.URL.createObjectURL || window.webkitURL.createObjectUR;
    return new Promise((resolve) => {
        const fReader = new FileReader();
        fReader.readAsDataURL(file);
        fReader.onload = (e) => {
            //document.querySelector('#imgurl').src = e.target.result || createObjectURL(file);
            e && e.target && e.target.result && Jimp.read(e.target.result as any).then(res => {
                const {data, width, height} = res.bitmap;

                const result = jsQR(data as any, width, height)
                const file: HTMLInputElement = document.getElementById(fileName) as HTMLInputElement
                file && file.remove()
                resolve(result ? result.data : result)

                /*try {
                    const resolve = await jsQR(data as any, width, height);
                    this.audio.play();
                    this.seuccess(resolve);
                } catch (err) {
                    this.error("识别失败，请检查二维码是否正确！", err);
                } finally {
                    console.info("读取到的文件：", res);
                }*/
            }).catch((err) => {
                resolve(null)
                console.error(err);
            });
        };
    })
}


export default () => {
    return new Promise(resolve => {
        getFile(resolve)
    })
}
