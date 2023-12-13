import css from './ContentSelector.module.css';
import Sider from 'antd/es/layout/Sider';

function ContentSelector({title, children}) {

  return (
    <Sider width={280} className={css.contentSelector} theme={'light'}>
      <div className={css.header}>
        <p className={css.headerTitle}>{title}</p>
      </div>
      <div className={css.content}>
        {children}
      </div>
    </Sider>
  );
}

export default ContentSelector;
