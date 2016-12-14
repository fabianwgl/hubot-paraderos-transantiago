// Description
//   Informa la disponibilidad de recorridos y el tiempo de llegada de un determinado paradero
//
// Commands:
//   hubot paradero [codigo_paradero] <devuelve los recorridos cercanos>
//
// Author:
//   Fabian General <fabianwgl@gmail.com>

'use strict';

const tsapi = require('transantiago-client');

module.exports = robot => {
  const flatten = list => list.reduce((a, b) =>
    a.concat(Array.isArray(b) ? flatten(b) : b), []
  );

  const sortData = data => {
    return flatten(data.avail.map(x => {
      return x.buses.map(y => {
        const distance = parseInt(y.dist.replace(/[mts.\s]/g, ''));
        return {
          name: `${x.service}: ${y.bus}`,
          time: y.arrivaltime,
          distance: distance
        };
      });
    })).sort((a, b) => {
      if (a.distance < b.distance) {
        return -1;
      } else if (a.distance > b.distance) {
        return 1;
      } else {
        return 0;
      }
    });
  };

  const makeAttachments = data => {
    const fields = data.map(x => ({
      title: x.name,
      value: `:clock4: ${x.time} (${x.distance}m)`,
      short: true
    }));
    const text = data.map(x =>
      `${x.name}, :clock4: ${x.time} (${x.distance}m)`
    ).join('\n');
    return {
      as_user: true,
      link_names: 1,
      attachments: [{fallback: text, color: '#36a64f', fields: fields}]
    };
  };

  robot.respond(/paradero (.*)/i, res => {
    const paradero = escape(res.match[1]);
    if (paradero !== '' || paradero !== null) {
      tsapi(paradero)
        .then(sortData)
        .then(makeAttachments)
        .then(options =>
          robot.adapter.client.web.chat.postMessage(res.message.room, null, options)
        ).catch(err => {
          res.send(`Ocurrio un error. Error: ${err.message}`);
          robot.emit('error', err);
        });
    }
  });
};
