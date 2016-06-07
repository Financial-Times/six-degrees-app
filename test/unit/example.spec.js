(function () {
    'use strict';

    describe('async tests', function () {

        // Before Hooks
        it('waits for the done callback', function () {

            before(function (done) {
                setTimeout(done, 300);
            });

            beforeEach(function (done) {
                setTimeout(done, 300);
            });

            // Tests
            it('should foo', function (done) {
                setTimeout(done, 300);
            });

            it('should bar', function (done) {
                setTimeout(done, 300);
            });

            // After Hooks
            afterEach(function (done) {
                setTimeout(done, 300);
            });

            after(function (done) {
                setTimeout(done, 300);
            });

        });
    });


    describe('chai', function () {

        it('should expose expectation', function () {

            expect(3).to.equal(3);
            expect(3).to.not.equal('three');
            expect([1, [2, [3]]]).to.deep.equal([1, [2, [3]]]);
            expect(new Error('foo')).to.be.instanceOf(Error);
            expect('foo').to.be.a('string');
            expect(!false).to.be.true;
        });

    });

    describe('sinon', function () {

        it('should expose spies', function () {

            var func = sinon.spy();

            func(1, 'foo');
            expect(func.called).to.be.true;
            // The following two assertions are identical
            expect(func.calledOnce).to.be.true;
            expect(func.callCount).to.equal(1);
            // The following two assertions are identical
            expect(func.firstCall.calledWith(sinon.match.number, sinon.match.string)).to.be.true;
            expect(func.getCall(0).calledWith(sinon.match.number, sinon.match.string)).to.be.true;
            // You can even verify that a function was called with specific arguments (not just types)
            expect(func.firstCall.calledWith(1, 'foo')).to.be.true;

        })

        it('should expose stubs', function () {

            var func = sinon.stub();

            func.withArgs(42).returns(1);
            func.throws();

            expect(func(42)).to.equal(1);
            expect(func).to.throw(Error);
        });

    });

}());
