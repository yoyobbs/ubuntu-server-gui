define(function (requirejs) {
    var $ = requirejs('jquery'),
        NoobTourPopover = requirejs('views/modal/NoobTourPopover');

    describe('NoobTourPopover - ItemView', function() {
        var noobTourPopover, footerPosStub;

        beforeEach(function() {
            footerPosStub = spyOn($.prototype, 'offset');
        });

        describe('onRender', function() {
            var windowResizeSpy;

            beforeEach(function() {
                footerPosStub.and.returnValue({top: 500});
                windowResizeSpy = spyOn($.prototype, 'resize');
                noobTourPopover = new NoobTourPopover();
                noobTourPopover.render();
            });

            afterEach(function() {
                noobTourPopover.destroy();
            });

            it('should set "top" and "left" coordinates"', function() {
                (noobTourPopover.$el.css('top')).should.equal('415px'); // 500 - 85
                (noobTourPopover.$el.css('left')).should.equal('3px');

            });

            it('should set "display: block"', function() {
                (noobTourPopover.$el.css('display')).should.equal('block');
            });

            it('should bind to "window.resize"', function() {
                expect(windowResizeSpy).toHaveBeenCalled();
            });

        });

        describe('onWindowResize', function() {
            beforeEach(function() {
                footerPosStub.and.returnValue({top: 400});
                noobTourPopover = new NoobTourPopover();
                noobTourPopover.render();
                noobTourPopover.onWindowResize();
            });

            afterEach(function() {
                noobTourPopover.destroy();
            });

            it('should update "top" css coordinate', function() {
                noobTourPopover.$el.css('top').should.equal('315px'); // 400 - 115
            });
        });

        describe('onDestroy', function() {

            var offSpy, onDestroySpy;
            beforeEach(function() {
                footerPosStub.and.returnValue({top: 505});
                offSpy = spyOn($.prototype, 'off');
                onDestroySpy = spyOn(NoobTourPopover.prototype, 'onBeforeDestroy').and.callThrough();

                noobTourPopover = new NoobTourPopover();
                noobTourPopover.render();
                noobTourPopover.destroy();
            });

            it('should be called when an instance of NoobTourPopover is destroyed', function() {
                expect(onDestroySpy).toHaveBeenCalled();
            });

            it('should unbind "window.resize" event', function() {
                expect(offSpy.calls.argsFor(1)[0]).toBe('resize');
            });

        });

    });
});