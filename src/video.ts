import jsQR from "jsqr";

interface Point {
    x: number;
    y: number;
}

let canvas: HTMLCanvasElement
let canvas2d: CanvasRenderingContext2D | null = null
let timer: any = 0
let mediaStreamTrack: MediaStream | null = null
let isAnimation = false
const canvasName = `canvas${new Date().getTime()}`
const videoName = `canvas${new Date().getTime()}`
//@ts-ignore
const _getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

const getCanvas = () => {
    let canvas: HTMLCanvasElement = document.getElementById(canvasName) as HTMLCanvasElement
    canvas && canvas.remove()
    canvas = document.createElement("canvas")
    canvas.style.position = 'fixed';
    canvas.style.top = '100vh';
    canvas.style.left = '100vw';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.display = 'none';
    document.body.append(canvas)
    canvas2d = canvas.getContext('2d')
    return canvas
}

const getVideo = () => {
    let video: HTMLVideoElement = document.getElementById(videoName) as HTMLVideoElement
    video && video.remove()
    //video.style.display = 'none';
    video = document.createElement('video')
    //document.body.append(video)
    return video
}

const getUserMedia = (data: MediaStreamConstraints): Promise<MediaStream> => {
    if (navigator.mediaDevices) {
        return navigator.mediaDevices.getUserMedia(data)
    } else if (_getUserMedia) {
        return new Promise((resolve, reject) => _getUserMedia(data, resolve, reject))
    } else {
        if (navigator.userAgent.toLowerCase().match(/chrome/) && window.location.origin.indexOf('https://') < 0) {
            console.error('获取浏览器录音功能，因安全性问题，需要在localhost 或 127.0.0.1 或 https 下才能获取权限！');
        } else {
            alert('对不起：未识别到扫描设备!');
        }
        return Promise.reject(new Error('api not found'))
    }
}

const draw = (begin: Point, end: Point) => {
    if (canvas2d) {
        canvas2d.beginPath();
        canvas2d.moveTo(begin.x, begin.y);
        canvas2d.lineTo(end.x, end.y);
        canvas2d.lineWidth = 3;
        canvas2d.strokeStyle = "red";
        canvas2d.stroke();
    }
};

export const videoCancel = () => {
    isAnimation = false
    cancelAnimationFrame(timer)
    //const canvas: HTMLCanvasElement = document.getElementById(canvasName) as HTMLCanvasElement
    canvas && canvas.remove()
    canvas2d = null
    if (mediaStreamTrack) {
        mediaStreamTrack.getTracks().map(item => item.stop())
        mediaStreamTrack = null
    }
}

const untie = (video: HTMLVideoElement, callback?: (code: string) => void) => {
    if (canvas2d) {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            const {videoWidth, videoHeight} = video;
            canvas.width = videoWidth;
            canvas.height = videoHeight;
            canvas2d.drawImage(video, 0, 0, videoWidth, videoHeight);
            try {
                const img = canvas2d.getImageData(0, 0, videoWidth, videoHeight);
                //document.querySelector('#imgurl').src = img;
                const obj = jsQR(img.data, img.width, img.height, {inversionAttempts: 'dontInvert'});
                if (obj) {
                    const loc = obj.location;
                    draw(loc.topLeftCorner, loc.topRightCorner);
                    draw(loc.topRightCorner, loc.bottomRightCorner);
                    draw(loc.bottomRightCorner, loc.bottomLeftCorner);
                    draw(loc.bottomLeftCorner, loc.topLeftCorner);
                    if (obj.data) {
                        videoCancel()
                        callback && callback(obj.data)
                        //this.seuccess(obj);
                    }
                } else {
                    console.error("识别失败，请检查二维码是否正确！");
                }
            } catch (err) {
                console.error("识别失败，请检查二维码是否正确！", err);
            }

        }
        if (isAnimation) {
            timer = requestAnimationFrame(() => {
                untie(video, callback);
            });
        }
    } else {
        isAnimation = false
        cancelAnimationFrame(timer)
    }
};

export default () => {
    return new Promise(resolve => {
        isAnimation = true;
        //canvas.style.display = "block";
        canvas = getCanvas()

        //navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        const video = getVideo()
        getUserMedia({
            video: {facingMode: "environment"}
        }).then(stream => {
            mediaStreamTrack = stream
            video.srcObject = stream as any;
            video.setAttribute('playsinline', 'true');
            video.setAttribute('webkit-playsinline', 'true');
            video.addEventListener('loadedmetadata', () => {
                video.play();
                untie(video, resolve);
            });
        }).catch(error => {
            resolve(null)
            console.error(error.name + "：" + error.message + "，" + error.constraint);
        });
    })
};
