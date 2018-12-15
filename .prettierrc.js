module.exports = {
  parser: 'babylon',
  printWidth: 120, // 每行最大120字符
  semi: true, // 末尾分号
  singleQuote: true, // 使用单引号
  override: [
    {
      files: '*.ts',
      options: {
        parser: 'typescript'
      }
    }
  ]
};
