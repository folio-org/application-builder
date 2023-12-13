import css from './FileLoader.module.css';
import {Button, Upload} from "antd";
import {UploadOutlined} from "@ant-design/icons";

function FileLoader({title, onFileLoad}) {
  const beforeUpload = (file) => {
    const reader = new FileReader();
    reader.onload = event => onFileLoad(event.target.result);
    reader.readAsText(file);
    return false;
  };

  return (
    <Upload accept=".json"
            beforeUpload={beforeUpload}
            showUploadList={false}
            className={css.upload}
            multiple={true}>
      <Button className={css.uploadButton} icon={<UploadOutlined width={100}/>}>{title}</Button>
    </Upload>
  );
}

export default FileLoader;
