class Vue {
  constructor(options) {
    this.$el = document.querySelector(options.el);
    this.$data = options.data;
    this.$options = options;
    this.compile(this.$el);
  }

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
          return this.$data[vmKey];
        })
      }

    })
  }
}