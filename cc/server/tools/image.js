import cs from 'opencv';


export function cvReadImage(url){
	return new Promise((resolve, reject) => {
		cv.readImage('./img/myImage.jpg', function (err, img) {
			if (err) {
				reject(err);
			}
			resolve(img);
		});
	})
}

function addWhiteBackgroundToImage(){

}
cv.readImage('./img/myImage.jpg', function (err, img) {
  if (err) {
    throw err;
  }

  const width = im.width();
  const height = im.height();

  if (width < 1 || height < 1) {
    throw new Error('Image has no size');
  }

  // do some cool stuff with img

  // save img
  img.save('./img/myNewImage.jpg');
});