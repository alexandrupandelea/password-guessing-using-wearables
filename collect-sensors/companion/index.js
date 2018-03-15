import { peerSocket, MessageSocket } from "messaging";
import * as messaging from "messaging";
import { outbox } from "file-transfer";

console.log("Companion running");

let ackHandle = -1;
let arr = [];

function sendAck(isDone) {
  if (peerSocket.readyState === peerSocket.OPEN) {
      peerSocket.send("ack");

    if (ackHandle != -1)
      clearInterval(ackHandle);
  }
}

messaging.peerSocket.onmessage = (evt) => {
  console.log("Comp recv " + evt.data.length);

  if (evt.data === "done") {
    console.log("Comp: " + arr.length);
    arr = []
  } else {
    arr = arr.concat(evt.data);
  }

  if (peerSocket.readyState === peerSocket.OPEN)
    sendAck();
  else
    ackHandle = setInterval(sendAck, 200);
}

var data = {"bla" : 2};

// postData('http://35.198.230.150', {answer: 42})
//   .then(data => console.log(data))
//   .catch(error => console.error(error))

 setInterval(send_demo_data, 3000);
function send_demo_data() {

  //HOW TO GET TIMESTAMP
//   fetch("http://35.185.181.126:80/password", {
//       headers : {
//         'Content-Type': 'text/html',
//         'Accept': 'text/html'
//        }
//     })
//   .then(
//     function(response) {
//       if (response.status !== 200) {
//         console.log('Looks like there was a problem. Status Code: ' +
//           response.status);
//         return;
//       }
//       // Examine the text in the response
//       response.text()
//       .then(function(data) {
//         console.log(data);
//       })
//       .catch(function(err) {
//         console.log(err);
//       });
//     }
//   )
//   .catch(function(err) {
//     console.log('Fetch Error :-S', err);
//   });

        //test post not working with my server
        fetch( 'http://35.184.182.125:80',
        {
                method: 'POST',
                headers: new Headers({
                  'Content-Type': 'text/html'
                }),
                body: "foo=bar&lorem=ipsum"
        }
        ).then(
            function(response) {
            if (response.status !== 200) {
              console.log('Looks like there was a problem. Status Code: ' +
                response.status);
              return;
            }

            // Examine the text in the response
            response.text()
            .then(function(data) {
              console.log("suc" + data);
            })
            .catch(function(err) {
              console.log(err);
            });
          })
        .catch(function(error){ console.log(error.message);});
}

send_demo_data();
