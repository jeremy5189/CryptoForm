document.addEventListener('DOMContentLoaded', function() {

  var node = document.getElementById('root');

  var app = Elm.Main.embed(node,
    { anonymous: false
    , baseUrl: "https://cryptoform.freepressunlimited.org/api/"
    , defaultEmail: "anonymous@451labs.org"
    , defaultName: "John Doe"
    , defaultSubject: ""
    , domain: "451labs.org"
    , private: true
    , showAttachments: true
    , showFrom: true
    , showSecurity: true
    , showSubject: true
    , showTo: true
    });

  app.ports.verify.subscribe(function(data) {
    kbpgp.KeyManager.import_from_armored_pgp({armored: data[0]}
      , function(err, alice) {
        if (!err) {
          app.ports.fingerprint.send([data[1], alice.get_pgp_fingerprint_str()]);
        }
      });
  });

  app.ports.encrypt.subscribe(function(data) {
    kbpgp.KeyManager.import_from_armored_pgp({armored: data.publicKeys}
      , function(err, alice) {
        if (!err) {
          var params = {
            msg: data.data,
            encrypt_for: alice
          };
          kbpgp.box(params, function(err, result_string, result_buffer) {
            app.ports.ciphertext.send(result_string);
          });
        }
      });
  });
});
