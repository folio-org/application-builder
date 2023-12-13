import css from './JsonContent.module.css';
import {Button} from "antd";
import {CheckOutlined, CopyOutlined} from "@ant-design/icons";
import {useState} from "react";

function JsonContent({value}) {
  const [icon, setIcon] = useState(<CopyOutlined/>);
  const copyContent = () => {
    navigator.clipboard.writeText(JSON.stringify(value, null, 2));
    setIcon(<CheckOutlined />);
    setTimeout(() => setIcon(<CopyOutlined/>), 1500);
  };

  return (
    <div className={css.textBlock}>
      <Button className={css.copyButton} icon={icon} onClick={copyContent}/>
      <pre className={css.jsonCode}>{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
}

export default JsonContent;
