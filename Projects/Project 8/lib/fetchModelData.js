/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 *
 * @returns a Promise that should be filled with the response of the GET request
 * parsed as a JSON object and returned in the property named "data" of an
 * object. If the request has an error, the Promise should be rejected with an
 * object that contains the properties:
 * {number} status          The HTTP response status
 * {string} statusText      The statusText from the xhr request
 */
function fetchModel(url) {
  return new Promise((resolve, reject) => {
    console.log(url);

    // Use fetch API to make a GET request
    fetch(url)
      // eslint-disable-next-line consistent-return
      .then(response => {
        if (!response.ok) {
          // Reject the promise if response status is not OK (200-299)
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({
            status: response.status,
            statusText: response.statusText
          });
        } else {
          // If successful, parse JSON
          return response.json();
        }
      })
      .then(data => {
        // Resolve the promise with the data inside an object
        resolve({ data });
      })
      .catch(() => {
        // Handle network or fetch-level errors
        // eslint-disable-next-line prefer-promise-reject-errors
        reject({
          status: 500,
          statusText: "Network Error"
        });
      });
  });
}

export default fetchModel;
