import css from './ContentList.module.css';
import {Button, Dropdown} from 'antd';
import {toMenuActions} from "../../utils/utils";

function ContentList({title, recordsNumber, dropDownActions, children}) {
  return (
    <div className={css.contentList}>
      <div className={css.header}>
        <div className={css.headerTitle}>
          <p className={css.contentTypeName}>{title}</p>
          <p className={css.recordsCountTitle}>{recordsNumber} {recordsNumber === 1 ? 'record' : 'records'} found</p>
        </div>
        {dropDownActions &&
          <Dropdown trigger='click'
                    placement="bottomRight"
                    className={css.actionButton}
                    menu={toMenuActions(dropDownActions)}>
            <Button onClick={event => event.preventDefault()} type='primary' size='small'>Actions</Button>
          </Dropdown>}
      </div>
      {children}
    </div>
  );
}

export default ContentList;
