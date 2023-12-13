import css from './AppHeader.module.css';
import {Header} from 'antd/es/layout/layout';
import {Button, Dropdown} from "antd";
import {toMenuActions} from "../../utils/utils";
import {MenuOutlined} from "@ant-design/icons";

function AppHeader({actions}) {
  return (
    <Header className={css.header}>
      <div className={css.headerTitle}>Application Builder</div>
      <Dropdown trigger='click'
                className={css.actionButton}
                placement="bottomRight"
                menu={toMenuActions(actions)}>
        <Button type="text"
                onClick={event => event.preventDefault()}
                icon={<MenuOutlined style={{color: "white"}}/>}/>
      </Dropdown>
    </Header>
  );
}

export default AppHeader;
