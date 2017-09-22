$('.carousel').carousel();
jQuery(function() {
	initBackgroundResize();
	initRetinaCover();
});
// stretch background to fill blocks
function initBackgroundResize() {
	jQuery('.bg-stretch').each(function() {
		ImageStretcher.add({
			container: this,
			image: 'img'
		});
	});
}
function initRetinaCover() {
	jQuery('.service-header-img-bg').retinaCover();
}
/*
 * Image Stretch module
 */
var ImageStretcher = {
	getDimensions: function(data) {
		// calculate element coords to fit in mask
		var ratio = data.imageRatio || (data.imageWidth / data.imageHeight),
			slideWidth = data.maskWidth,
			slideHeight = slideWidth / ratio;

		if(slideHeight < data.maskHeight) {
			slideHeight = data.maskHeight;
			slideWidth = slideHeight * ratio;
		}
		return {
			width: slideWidth,
			height: slideHeight,
			top: (data.maskHeight - slideHeight) / 2,
			left: (data.maskWidth - slideWidth) / 2
		};
	},
	getRatio: function(image) {
		if(image.prop('naturalWidth')) {
			return image.prop('naturalWidth') / image.prop('naturalHeight');
		} else {
			var img = new Image();
			img.src = image.prop('src');
			return img.width / img.height;
		}
	},
	imageLoaded: function(image, callback) {
		var self = this;
		var loadHandler = function() {
			callback.call(self);
		};
		if(image.prop('complete')) {
			loadHandler();
		} else {
			image.one('load', loadHandler);
		}
	},
	resizeHandler: function() {
		var self = this;
		jQuery.each(this.imgList, function(index, item) {
			if(item.image.prop('complete')) {
				self.resizeImage(item.image, item.container);
			}
		});
	},
	resizeImage: function(image, container) {
		this.imageLoaded(image, function() {
			var styles = this.getDimensions({
				imageRatio: this.getRatio(image),
				maskWidth: container.width(),
				maskHeight: container.height()
			});
			image.css({
				width: styles.width,
				height: styles.height,
				marginTop: styles.top,
				marginLeft: styles.left
			});
		});
	},
	add: function(options) {
		var container = jQuery(options.container ? options.container : window),
			image = typeof options.image === 'string' ? container.find(options.image) : jQuery(options.image);

		// resize image
		this.resizeImage(image, container);

		// add resize handler once if needed
		if(!this.win) {
			this.resizeHandler = jQuery.proxy(this.resizeHandler, this);
			this.imgList = [];
			this.win = jQuery(window);
			this.win.on('resize orientationchange', this.resizeHandler);
		}

		// store item in collection
		this.imgList.push({
			container: container,
			image: image
		});
	}
};
/*
 * jQuery retina cover plugin
 */
 ;(function($) {
 	'use strict';

 	var styleRules = {};
 	var templates = {
 		'2x': [
 			'(-webkit-min-device-pixel-ratio: 1.5)',
 			'(min-resolution: 192dpi)',
 			'(min-device-pixel-ratio: 1.5)',
 			'(min-resolution: 1.5dppx)'
 		],
 		'3x': [
 			'(-webkit-min-device-pixel-ratio: 3)',
 			'(min-resolution: 384dpi)',
 			'(min-device-pixel-ratio: 3)',
 			'(min-resolution: 3dppx)'
 		]
 	};

 	function addSimple(imageSrc, media, id) {
 		var style = buildRule(id, imageSrc);

 		addRule(media, style);
 	}

 	function addRetina(imageData, media, id) {
 		var currentRules = templates[imageData[1]].slice();
 		var patchedRules = currentRules;
 		var style = buildRule(id, imageData[0]);

 		if (media !== 'default') {
 			patchedRules = $.map(currentRules, function(ele, i) {
 				return ele + ' and ' + media;
 			});
 		}

 		media = patchedRules.join(',');
 		
 		addRule(media, style);
 	}

 	function buildRule(id, src) {
 		return '#' + id + '{background-image: url("' + src + '");}';
 	}

 	function addRule(media, rule) {
 		var $styleTag = styleRules[media];
 		var styleTagData;
 		var rules = '';

 		if (media === 'default') {
 			rules = rule + ' ';
 		} else {
 			rules = '@media ' + media + '{' + rule + '}';
 		}

 		if (!$styleTag) {
 			styleRules[media] = $('<style>').text(rules).appendTo('head');
 		} else {
 			styleTagData = $styleTag.text();
 			styleTagData = styleTagData.substring(0, styleTagData.length - 2) + ' }' + rule + '}';
 			$styleTag.text(styleTagData);
 		}
 	}

 	$.fn.retinaCover = function() {
 		return this.each(function() {
 			var $block = $(this);
 			var $items = $block.children('[data-srcset]');
 			var id = 'bg-stretch' + Date.now() + (Math.random() * 1000).toFixed(0);

 			if ($items.length) {
 				$block.attr('id', id);

 				$items.each(function() {
 					var $item = $(this);
 					var data = $item.data('srcset').split(', ');
 					var media = $item.data('media') || 'default';
 					var dataLength = data.length;
 					var itemData;
 					var i;

 					for (i = 0; i < dataLength; i++) {
 						itemData = data[i].split(' ');

 						if (itemData.length === 1) {
 							addSimple(itemData[0], media, id);
 						} else {
 							addRetina(itemData, media, id);
 						}
 					}
 				});
 			}

 			$items.detach();
 		});
 	};
 }(jQuery));