// https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects

addNewReview = () => {
  const addReview = document.forms.namedItem('newReview');
  addReview.addEventListener('submit', function (ev) {

    var oOutput = document.querySelector('div'),
      oData = new FormData(addReview);

    oData.append('CustomField', 'Thank you for submitting.');

    var oReq = new XMLHttpRequest();
    oReq.open('POST', 'restaurant.html', true);
    oReq.onload = function (oEvent) {
      if (oReq.status === 200) {
        oOutput.innerHTML = 'Review Sent!';
      } else {
        oOutput.innerHTML = 'Error ' + oReq.status + ' occurred when trying to submit your review.<br />';
      }
    };
    console.log(oData);

    oReq.send(oData);
    ev.preventDefault();
  }, true);
};
