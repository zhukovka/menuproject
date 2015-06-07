var Accordion = (function() {
    return {
        init: function() {
            var self = this;
            jQuery.fn.extend({
                sideSlideAnimation: function(opts) {
                    opts.$el = $(this);
                    opts.animation = self.slideAnimation;
                    self.sideSlideAnimation(opts);
                    return $(this);
                },
                collapseUp: function(target) {

                    $(this).on('click', function(event) {
                        event.preventDefault();
                        var target = target || $(this).attr('data-collapse') || $(this).attr('href');
                        $(target).slideToggle('slow');
                        $(this).toggleClass('collapsed');
                    });
                }

            })
        },
        setWidth: function(el, childWidth, clones) {
            var coef = childWidth || 1,
                clones = clones || 2,
                parentWidth = el.parent().width(),
                w = parentWidth * coef;

            el.children().outerWidth(w);
            console.log('width', w);
            el.width(w * (el.children().length + clones));
        },
        extendSettingsObject: function(obj) {
            obj.$items = obj.$el.find('.item');
            obj.$first = obj.$items.first();
            if (!obj.time) {
                obj.time = 2000;
            }
        },
        sideSlideAnimation: function(obj) {
            /*set variables*/
            this.extendSettingsObject(obj);
            var self = this;
            obj.$el.parent().css('overflow', 'hidden');
            /*set width of parent list*/
            if (obj.width) {
                this.setWidth(obj.$el, obj.width, 2);
            } else {
                this.setWidth(obj.$el);
                // console.log('obj.$items', obj.$items.width());
                // obj.$el.width(obj.$el.parent().width()*obj.$items.length);
            }

            /*show all banners*/
            if (obj.banner) {
                obj.$items.find(obj.banner).show();
            }
            obj.$last = obj.$items.last();

            /*add clones to DOM*/
            obj.$first.clone().appendTo(obj.$el).addClass('first');
            obj.$last.clone().prependTo(obj.$el).addClass('last');

            /*obj.left - left position of the list*/
            obj.left = -obj.$first.position().left;

            if (obj.dots) {
                obj.$dots = $('.dots');
                obj.$dots.children(':first-child').addClass('active');
            }

            if (obj.controls) {

                obj.$el.parent().on('click', '.slider-controls', function(event) {
                    event.preventDefault();
                    var direction = $(this).attr('data-controls');
                    self.slide.call(obj, direction);
                    /* Act on the event */
                });

            }

            /*position first element to the start*/
            obj.$el.css({
                left: obj.left + 'px'
            });

            /*add active classes*/
            obj.$first.addClass('active');



            /*click on dot controls sliding*/
            if (obj.dots) {
                obj.$dots.on('click', 'li', function(event) {
                    event.preventDefault();
                    var item = obj.$items.eq($(this).attr('data-dot')),
                        newLeft = item.position().left;

                    obj.$el.stop();
                    clearInterval(obj.animate);
                    obj.animation(newLeft, item);
                });
            }

            /*start animation*/
            if (obj.repeat) {
                obj.repeatFn = this.slide;
                obj.animate = setTimeout(obj.repeatFn.bind(obj), obj.time);
            }
        },
        slide: function(direction, first) {
            var direction = direction || 'right',
                first = first || this.$first,
                /*next item depends on the direction*/
                second = (direction == 'right') ? first.next() : first.prev(),
                /*newLeft - new left position of the list to slide to*/
                newLeft = second.position().left,
                self = this;

            /*set left position of the list to the left position of the first element*/
            this.left = first.position().left;
            console.log(this.left);

            if (second.is(':last-child')) {
                /*if next item is the last (that means clone of the first) 
                we go back to the left 0*/
                self.left = 0;
                this.$el.css({
                    left: self.left
                });

                newLeft = self.$items.first().position().left;
            } else if (second.is(':first-child')) {
                /*if next item is the first (that means clone of the last) 
                we go to the left position of the last item in the list*/
                self.left = this.$el.children(':last-child').position().left;
                this.$el.css({
                    left: -self.left
                });
                newLeft = self.$items.last().position().left;
            }

            this.animation(newLeft, second);

        },
        slideAnimation: function(newLeft, newFirst) {
            var self = this;
            this.$el.animate({
                left: -newLeft
            }, {
                duration: self.time,
                complete: function() {
                    /*remove active class from the first item and dot*/

                    self.$first.removeClass('active');
                    if (self.dots) {
                        self.$dots.children(':nth-child(' + (self.$items.index(self.$first) + 1) + ')').removeClass('active');
                    }

                    if (newFirst.is(':last-child')) {
                        /*if next item is the last set the object's first to the first of self.$items*/
                        self.$first = self.$items.first();
                    } else if (newFirst.is(':first-child')) {
                        /*if next item is the first set the object's first to the last of self.$items*/
                        self.$first = self.$items.last();
                    } else {
                        /*set the first to @newFirst*/
                        self.$first = newFirst;
                    }

                    /*remove active class from the new first item and dot*/
                    self.$first.addClass('active');

                    if (self.dots) {
                        self.$dots.children(':nth-child(' + (self.$items.index(self.$first) + 1) + ')').addClass('active');
                    }
                    if (self.repeat) {
                        self.animate = setTimeout(self.repeatFn.bind(self), self.time);
                    }
                }
            });
        }
    }
})();