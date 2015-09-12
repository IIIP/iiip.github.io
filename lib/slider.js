// 
//  slider.js
//  
//  
//  Created by gld on 2015-08-07.
//  Copyright 2015 gld. All rights reserved.
// 
(function($, window, document, undefined) {
	var zSlider = function(element, options) {

		this.$element = element; //element即#slider元素
		this.options = $.extend(true, {
			animate: 'roll',
			direction: 'horizontal', //滚动方向,vertical重直滚动,horizontal水平滚动
			event: "mouseover",
			duration: 3000, //播放频率
			speed: 500, //滚动速度
			auto: true //是否自动播放
		}, options);
	}
	zSlider.prototype = {

		init: function() {

			//所有图片
			this.imgs = this.$element.find('.' + this.options.wrapperClass + ' img');
			//			this.imgs.css({
			//				width: $(document).width() + "px"
			//			});
			this.resizedWidth = $(document.body).width();
			this.resizedHeight = $(this.$element).height();

			//调整图片大小
			var Z = this;
			this.imgs.each(function() {
				Z.resizeImg($(this), Z.resizedWidth, Z.resizedHeight);
			});

			//图片数量
			this.number = this.imgs.length;

			this.index = 0; //开始的索引
			//图片宽度
			this.width = $('.' + this.options.wrapperClass, this.$element).find('img:first').width();
			//图片高度
			this.height = $('.' + this.options.wrapperClass, this.$element).find('img:first').height();
			//幻灯片包装盒
			this.sliderWrapper = this.$element.find('.' + this.options.wrapperClass);
			//图片包装盒
			this.imgWrapper = this.sliderWrapper.children();

			//设置幻灯片为相对定位
			this.$element.css({
				position: 'relative',
				overflow: 'hidden'
			});
			//设置幻灯片包装盒为绝对定位
			this.sliderWrapper.css({
				'position': 'absolute',
				'top': '0px',
				'left': '0px',
				'list-style': 'none',
				'padding': '0px'

			});

			//如果为水平滚动，设置幻灯片包装盒的宽度，图片包装盒为左浮动
			if (this.options.direction == 'horizontal' && this.options.animate == 'roll') {
				this.sliderWrapper.css({
					width: this.width * this.number + 'px'
				});
				this.imgWrapper.css({
					float: 'left'
				});
			}
			//生成导航
			this.createNav();
			//是否自动播放
			if (this.options.auto) this.play();
			//绑定事件，切换图片
			this.bind(this.options.event);
		},

		//编写生成导航方法
		createNav: function() {
			this.$element.append('<div class="nav"></div>');
			this.$nav = this.$element.find('.nav');
			for (var i = 1; i <= this.number; i++) {
				this.$nav.append('<span>●</span>')
			}
			this.$nav.css({

				'position': 'absolute',
				'z-index': 3,
				'left': '50%',
				'bottom': '20px',
				'text-align': 'center',
				'font-size': '0',
				'border-radius': '5px',
				'background-color': 'rgba(255,255,255,0.3)',
				'filter': 'alpha(opacity:30)',
				'padding-left': '4px',
				'padding-right': '4px'
			});
			this.$dots = this.$nav.find('span');
			this.$dots.css({
				'display': 'inline-block',
				'font-size': '14px',
				'color': '#fff',
				'text-decoration': 'none',
				'cursor': 'pointer',
				'margin': '2px',
				'padding': '2px'
			});
			this.$nav.find('span:first').addClass('on');
			this.$nav.find('.on').css({
				'color': 'orange'
			});
			var nav_margin_left = this.$nav.width() * (-0.5);
			//获取导航margin-left的偏移量，必需先设置好span的大小之后在获取,否则获取的将是父素的宽度
			this.$nav.css({
				'margin-left': nav_margin_left + 'px'
			});
		},

		//自动播放方法
		play: function() {
			var Z = this; //setInterval中的this是指向window对象，所以也要储存起来，以便在setInterval中使用
			if (this.$element.timer) clearInterval(this.$element.timer);
			this.$element.timer = setInterval(function() {
				Z.index++;
				if (Z.index >= Z.number) { //如果索引大于或者等于图片总数
					Z.index = 0;
				}
				Z.$dots.removeClass('on').css({
					'color': '#fff'
				});
				Z.$dots.eq(Z.index).addClass('on').css({
					'color': 'orange'
				});
				Z[Z.options.animate](); //图片动画
			}, this.options.duration);


		},

		//图片滚动动画 
		roll: function() {
			var Z = this;
			if (Z.options.direction == 'vertical') { //如果是垂直滚动	 
				$(Z.sliderWrapper).animate({
					top: -Z.height * Z.index + 'px'
				}, Z.options.speed);
			} else {
				$(Z.sliderWrapper).animate({
					left: -Z.width * Z.index + 'px'
				}, Z.options.speed);
			}
		},
		//绑定图片切换事件(即鼠标事件)
		bind: function(type) {
			var Z = this;
			this.$dots.bind(type, function() {
				Z.index = Z.$dots.index(this); //当前this指向的导航元素对象,例如span对象
				Z.$dots.removeClass('on').css({
					'color': '#fff'
				});
				Z.$dots.eq(Z.index).addClass('on').css({
					'color': 'orange'
				}); //停止当前所有动面，如果没有这一句，在快速切换导航时，图片将一直切换,直到所有动画执行完并，造成效果不佳。	 
				$(Z.sliderWrapper).stop();
				Z[Z.options.animate](); //图片动画	 
				clearInterval(Z.$element.timer);
			});
			this.$dots.bind('mouseout', function() {
				if (Z.options.auto) {
					Z.play();
				}
			})
		},
		resizeImg: function(img, boxWidth, boxHeight) {

			//var imgWidth = img.width();
			//var imgHeight = img.height();
			// 上面这种取得img的宽度和高度的做法有点儿bug 
			// src如果由两个大小不一样的图片相互替换时，上面的写法就有问题了，换过之后的图片的宽度和高度始终取得的还是换之前图片的值。
			// 解决方法：创建一个新的图片类，并将其src属性设上。
			var tempImg = new Image();
			tempImg.src = img.attr('src');

			var imgWidth = tempImg.width;
			var imgHeight = tempImg.height;

			img.width(boxWidth);
			//让图片居中显示
			var margin = (boxHeight - img.height()) / 2;    
			img.css("margin-top", margin);

		}
	}
	$.fn.zSlider = function(options) {
		var obj = new zSlider(this, options);
		obj.init();

		return this; //返回jQuery选择器的集合，以便链式调用
	}
})(jQuery, window, document);