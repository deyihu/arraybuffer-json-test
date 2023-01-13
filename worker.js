
const decoder = new TextDecoder();
// function copyObj(obj) {
//     if (structuredClone) {
//         return structuredClone(obj);
//     }
//     return JSON.parse(JSON.stringify(obj));
// }

function arrayBuffer2Json(typeArray) {
    const text = decoder.decode(typeArray);
    return JSON.parse(text);
}

function testWorkerStructuredClone(json) {
    const time = 'test Worker StructuredClone';
    console.time(time);
    postMessage(json);
    console.timeEnd(time);
}

function testWorkerTransfer(arrayBuffer, transferList) {
    const time = 'test Worker Transfer';
    console.time(time);
    postMessage(arrayBuffer, transferList);
    console.timeEnd(time);
}

onmessage = (e) => {
    const { url, type } = e.data || {};
    //模拟worker里只做请求，不做arraybuffer-json的解析
    if (type === 'arraybuffer') {
        fetch(url).then(res => res.arrayBuffer()).then(arrayBuffer => {
            testWorkerTransfer(arrayBuffer, [arrayBuffer]);
        })
    } else {
        //模拟worker里请求和arraybuffer的解析
        //因为arraybuffer->json的过程是在worker里完成的不影响主线程的，所以其对主线程的性能的影响只有 structuredClone
        fetch(url).then(res => res.arrayBuffer()).then(arrayBuffer => {
            const typeArray = new Uint8Array(arrayBuffer);
            const json = arrayBuffer2Json(typeArray);
            testWorkerStructuredClone(json, []);
        })
    }
}