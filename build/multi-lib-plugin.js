const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

function resolve() {
  return require('path').join.apply(null, [ process.cwd(), ...arguments ]);
}

class MultiLibPlugin{
  options = {}
  constructor(options = { mainDirectory: 'src/lib' }) {
    this.options = Object.assign({}, options);
  }
  apply(compiler) {
    const options = this.options;
    const libFiles = [];
    const typingFiles = [];
    globSync(options.mainDirectory + '/*.ts', { absolute: true }).forEach(function (file) {
      const winFile = file.replace(/\\/gim, '/');
      const item = {
        file: winFile,
        filename: path.basename(file),
        pureFileName: path.basename(file, path.extname(file)),
      }
      // 类型申明文件
      if (file.endsWith('.d.ts')) {
        typingFiles.push(item);
      } else {
        libFiles.push(item);
      }
    });

    // compiler.hooks.make.tapAsync('MultiLibPlugin', (compilation, callback) => {
    //   let num = 0;
    //   for (const item of libFiles) {
    //     // 在 compilation 对象上使用 addEntry 方法添加新的入口点
    //     compilation.addEntry(process.cwd(), path.resolve(item.file), item.pureFileName, () => {
    //       num++;
    //       if (num === libFiles.length) {
    //         callback();
    //       }
    //     });
    //   }
    // });

    // 复制类型申明文件
    let isCopy = false;
    const outputPath = compiler.options.output.path;
    compiler.hooks.afterEmit.tap(
      'MultiLibPlugin',
      () => {
        if (isCopy) {
          return undefined;
        }
        isCopy = true;
        for (const item of typingFiles) {
          fs.copyFile(item.file, path.join(outputPath, item.filename), () => {});
        }
      }
    );
  }
}

module.exports = MultiLibPlugin;
