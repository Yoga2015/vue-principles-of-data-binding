class Vue {
  constructor(options) {
    this.$el = document.querySelector(options.el);
    this.$data = options.data;
    this.$options = options;
    this.$watchEvent = {};
    this.proxyData();
    this.observe();
    this.compile(this.$el);
  }

  // 不想通过this.$data.str, 而想通过 this.str 就可以获取到 数据
  proxyData() {
    for (let key in this.$data) {
      Object.defineProperty(this, key, {
        get() {
          return this.$data[key]
        },
        set(val) {
          this.$data[key] = val;
        }
      })
    }
  }

  // 观察者
  observe() {
    for (let key in this.$data) {
      let value = this.$data[key];
      let _this = this;
      Object.defineProperty(this.$data, key, {
        get() {
          return value;
        },
        set(val) {
          value = val;
          // update
          _this.$watchEvent[key].forEach((item, index) => {
            item.update();
          })
        }
      })
    }
  }

  // 模板编译
  compile(node) {
    node.childNodes.forEach((item, index) => {
      // console.log(item.nodeType);  // 3

      // 判断 是否为 元素节点  1
      if (item.nodeType === 1) {
        if (item.hasAttribute('@click')) {
          let vmkey = item.getAttribute('@click');
          vmkey = vmkey.trim();
          // console.log(vmkey);  // cli
          item.addEventListener('click', () => {
            // console.log(111);
            // console.log(this.$options);  // {el: '#app', data: {…}, methods: {…}}
            // console.log(this.$options.methods[vmkey]);  // ƒ cli() {  alert('YOYO!') ｝
            this.$options.methods[vmkey].call(this); // 指向 this 
          })
        }

        if (item.hasAttribute('v-model')) {
          let vmkey = item.getAttribute('v-model');
          vmkey = vmkey.trim();
          // console.log(item, vmkey); //<input type="text" v-model="str">  'str'

          item.value = this[vmkey];   // 数据驱动视图

          item.addEventListener('input', () => {
            this[vmkey] = item.value;
            console.log(this);
          })

        }

        if (item.childNodes.length > 0) {
          this.compile(item)
        }
      }

      // 判断 是否为 文本节点  3
      if (item.nodeType === 3) {
        let reg = /\{\{(.*?)\}\}/g;
        let text = item.textContent;
        item.textContent = text.replace(reg, (match, vmKey) => {
          // console.log(match, vmKey);       
          vmKey = vmKey.trim();

          let watcher = new Watch(this, vmKey, item, 'textContent');
          if (this.$watchEvent[vmKey]) {
            this.$watchEvent[vmKey].push(watcher);
          } else {
            this.$watchEvent[vmKey] = [];
            this.$watchEvent[vmKey].push(watcher);
          }
          return this.$data[vmKey];
        })
      }

    });
  }

}


class Watch {
  constructor(vm, key, node, attr) {
    this.vm = vm;
    this.key = key;
    this.node = node;
    this.attr = attr;
  }

  update() {    // item.textContent = this.$data[vmKey] 
    this.node[this.attr] = this.vm[this.key];
  }
}