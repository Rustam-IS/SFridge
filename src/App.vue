<script setup>
import {QrcodeStream} from 'vue-qrcode-reader'
import {computed, ref, getCurrentInstance, reactive, useTemplateRef} from "vue";
import VTable from "./components/VTable.vue";


let lang = {
  'softdrinks': "Безалкогольные напитки",
  "milk": "Молочная продукция",
};


let fmts = {
  time(time) {
    time /= 1000;

    let h = Math.floor((time / 3600) % 24);
    let d = Math.floor((time / 3600) / 24);

    let hs = `${h} `;

    if (10 <= h && h <= 20) {
      hs += "часов";
    } else {
      if (h % 10 == 1) {
        hs += "час";
      } else if ([1, 2, 3, 4].includes(h % 10)) {
        hs += "часа";
      } else {
        hs += "часов";
      }
    }

    let ds = `${d} `;

    if (10 <= d && d <= 20) {
      ds += "дней";
    } else {
      if (d % 10 == 1) {
        ds += "день"
      } else if ([2, 3, 4].includes(d % 10)) {
        ds += "дня";
      } else {
        ds += "дней";
      }
    }

    let str = ``;

    if (h == 0 && d == 0) {
      str = '< 1 часа';
    } else {

      if (h >= 1) {
        str = `${hs} `;
      }

      if (d >= 1) {
        str = `${ds} ` + str;
      }
    }

    if (time < 0) {
      str = "<strong> Просрочен </strong>";
    }

    return str;
  },

  ingr(items) {
    return items
        .trim()
        .replace(/\.+$/, "")
        .split(/\s*,\s*/)
        .map((item, ind) => {
          return `${ind + 1}. ${item[0].toUpperCase() + item.slice(1)}`;
        }).join("<br/>");
  }
};


async function add(code) {
  // fetch('https://mobile.api.crpt.ru/mobile/authorize/refresh', {
  //   method: 'POST',
  //   headers: {
  //     'Host': 'mobile.api.crpt.ru',
  //     'application-id': 'b2c',
  //     'Accept': 'application/json',
  //     'local-time': '1738789105706',
  //     'device-id': '459279452df7c1ffc9170d8ff97a6188f2b28c1259e8c55af378767441745c75',
  //     'Accept-Language': 'en-BE;q=1.0, ru-BE;q=0.9',
  //     'User-Agent': 'Platform: iOS 18.2.1; AppVersion: 4.60.1; AppVersionCode: 7935; Device: iPhone 15;',
  //     'Connection': 'keep-alive',
  //     'client': 'iOS 18.2.1; AppVersion: 4.60.1; Device: iPhone 15;',
  //     'request-id': '063047C4-F85C-432B-97FB-F1D9E17A2CC4',
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     'device_id': 'egWM_OfAs0R-hGZOHbtXIS:APA91bFt1aHk70V7T_7PfEV1m8gSN-ULjZuF1hwi2ScPPTqV5HHHQKFxwueI4skrai0A2tlVSUh-e8mFo9spvap9srROvNEuDrXEI9gnRbk4sRjk6SygQuE',
  //     'refresh_token': 'f0ed4b63-7160-4684-a29a-65a9c2c79e82',
  //     'instanceId': '3178A951-EA3D-4BFD-A99F-78944BD32788-c3da575a3e021e89c1fd9d083de2b0fa767bf899e0abf1d279edaeca87a7faa3',
  //     'client': 'iOS 18.2.1; AppVersion: 4.60.1; Device: iPhone 15;'
  //   })
  // });

  let response = await fetch('https://mobile.api.crpt.ru/v2/mobile/check', {
    method: 'POST',
    headers: {
      'Host': 'mobile.api.crpt.ru',
      'application-id': 'b2c',
      'Accept': 'application/json',
      'local-time': '1738591602759',
      'device-id': '459279452df7c1ffc9170d8ff97a6188f2b28c1259e8c55af378767441745c75',
      'Accept-Language': 'en-BE;q=1.0, ru-BE;q=0.9',
      'User-Agent': 'Platform: iOS 18.2.1; AppVersion: 4.60.1; AppVersionCode: 7935; Device: iPhone 15;',
      'Connection': 'keep-alive',
      'client': 'iOS 18.2.1; AppVersion: 4.60.1; Device: iPhone 15;',
      'request-id': '6C143404-3CD8-4383-8B9F-5DCCC164E3F7',
      'Content-Type': 'application/json',
      'Cookie': '_csrf=v8zio5lEqbxCHrtJYrzjcxqsBTfmaGBX'
    },
    body: JSON.stringify({
      'context': 'scan',
      'sid': '592e061c-961e-4780-8e43-847ab9c41a0c',
      'codeType': 'datamatrix',
      'code': `{FNC1}${code[0].rawValue}`,
      'userId': 56127098
    })
  });

  let result = await response.json();

  let flag = false;
  cart = cart.filter((item) => {
    flag = flag || item.uuid === result.code;
    return item.uuid !== result.code;
  });

  if (!flag) {
    let item = {
      uuid: result.code,
      name: result.productName,
      expires: JSON.parse(result.expireDate),
      ingredients: fmts.ingr(result.screen.items
          .find((el) => el.itemType === "attributes_card")
          .attrList.find((el) => el.label === "Состав").value),
      address: result.salePointData ? {
        lat: result.salePointData.placeLat,
        lng: result.salePointData.placeLng,
      } : undefined,
      notified: {
        h24: false,
        h0: false,
      },
      category: lang[result.category],
    }

    cart.push(item);
  }

  update();
  localStorage.setItem('cart', JSON.stringify(cart));
}

function del(key) {
  rows.value = rows.value.filter((cat) => {
    let count = 0;

    cat.data = cat.data.filter((item) => {
      count += item.uuid === key;
      return item.uuid !== key;
    })

    cat.count -= count;
    return cat.count > 0;
  });

  cart = cart.filter((item) => {
    return item.uuid !== key;
  })

  localStorage.setItem('cart', JSON.stringify(cart));
}

function update() {
  rows.value = [];
  for (let item of cart) {
    let dest = undefined;

    for (let row of rows.value) {
      if (row.category === item.category) {
        dest = row;
        break;
      }
    }

    if (!dest) {
      dest = {
        uuid: item.category,
        category: item.category,
        count: 0,

        data: [],

        cols: [
          {
            name: 'name',
            label: 'Название',
            field: 'name',
            align: 'left',
            required: true,
            sortable: true,
          },
          {
            name: 'expires',
            label: 'Годен еще',
            field: 'expires',
            align: 'left',
            sortable: true,
          }
        ]
      }
      rows.value.push(dest);
    }

    let copy = {...item};
    copy.expires = fmts.time(copy.expires);

    dest.count++;
    dest.data.push(copy);
  }
}


const cols = ref([
  {
    name: 'category',
    label: 'Категория',
    field: 'category',
    align: 'left',
    required: true,
    sortable: true,
  },
  {
    name: 'count',
    label: 'Продукты',
    field: 'count',
    align: 'left',
    sortable: true,
  }
])


let val = localStorage.getItem("cart");
let cart = val ? JSON.parse(val) : [];
let rows = ref([]);
update();

let qr = reactive({visibility: 'hidden'});
let btn = reactive({visibility: 'visible', backgroundColor: "white"});

let cur = Date.now();
let upd = ref(false);

setInterval(function () {
  cur += 60 * 60 * 1000;

  for (let cat of rows.value) {
    for (let item of cat.data) {
      for (let p of cart) {
        if (p.uuid == item.uuid) {
          let rem = p.expires - cur;
          item.expires = fmts.time(rem);

          if (rem <= 24 * 60 * 60 * 1000 && !item.notified.h24) {
            const opts = {
              body: `Через 24 часа испортится ${item.name}`,
            }
            new Notification("Умный холодильник", opts);
            item.notified.h24 = true;
          }

          if (rem <= 0 && !item.notified.h0) {
            const opts = {
              body: `Истек срок годности у ${item.name}`,
            }
            new Notification("Умный холодильник", opts);
            item.notified.h0 = true;
          }
        }
      }
    }
  }
  upd = !upd;
}, 1000);

function ask() {
  Notification.requestPermission().then((Permission) => {})
}

const qrs = [ "data_matrix" ];

</script>

<template>
  <header>
    Умный холодильник (Famex)
    <q-btn id="notifs">
      <q-icon name="notifications" :size="'3em'" @click="ask"> </q-icon>
    </q-btn>
  </header>
  <main>
    <div id="qrbox">
      <qrcode-stream
          id="qrcode"
          :formats="qrs"
          :style="qr"
          @detect="add"
          @click="qr.visibility = 'hidden', btn.visibility = 'visible'"
      ></qrcode-stream>
      <q-btn id="add" @click="btn.visibility = 'hidden', qr.visibility = 'visible'" :style="btn">
        <q-icon name="qr_code_scanner" :size="'8em'"> </q-icon>
      </q-btn>
    </div>
    Время ускорено в целях демонстрации

    <br/>
    <br/>

    <VTable :upd="upd" :cols="cols" :rows="rows" ref="vtable">
      <template #about="props">
        <VTable :del="del" :rows="props.row.data" :cols="props.row.cols" style="width: 100%">
          <template #about="props">
            <strong> Состав </strong>
            <div v-html="props.row.ingredients"></div>

            <br/>

            <strong> Место покупки </strong> <br/>
            <a v-if="props.row.address" target="_blank"
               :href="`https://yandex.ru/maps/?pt=${props.row.address.lng},${props.row.address.lat}&z=17`">На карте</a>
            <div v-else> Определить не удалось </div>
          </template>
        </VTable>
      </template>
    </VTable>
  </main>
</template>

<style>
html, body, #app {
  width: 100%;
  height: 100%;
  background-color: #f1f0f0;

  overflow-x: hidden;
}

* {
  font-size: 2vmin;
  font-family: Nunito;
}

main {
  display: block;
  justify-items: center;

  padding: 40px;
}

header {
  font-size: 2em;
  font-weight: bold;

  width: 100vw;
  height: 10vh;

  padding: 20px;

  background-color: #aaafaf;

  display: inline-block;
}

#notifs {
  margin-top: -10px;
  float: right;
  width: 70px;
  height: 70px;

  border-radius: 1em;
  border-style: solid;
  border-width: 0.5em;

  border-color: darkslategray;
}

#qrbox {
  width: 20em;
  height: 20em;

  max-width: 20em;
  max-height: 20em;

  border-radius: 1em;
  border-style: solid;
  border-width: 0.5em;

  overflow: hidden;
  padding-bottom: -10px;

  border-color: darkslategray;
  display: grid;
}

#qrcode {
  grid-column: 1;
  grid-row: 1;
}

#add {
  grid-column: 1;
  grid-row: 1;
}

main > * {
  width: 100%;
}


</style>
