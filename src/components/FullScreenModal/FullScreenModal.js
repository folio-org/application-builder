import css from './FullScreenModal.module.css';
import {Button} from 'antd';

function FullScreenModal({title, onClose, display, children}) {
  return (
    <div className={display ? css.content : css.hiddenContent}>
      <header className={css.header}>
        <Button onClick={onClose} className={css.closeButton} size='small'>Close</Button>
        <div className={css.headerTitle}>{title}</div>
      </header>
      {children}
    </div>
  );
}

export default FullScreenModal;
