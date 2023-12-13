import css from './RightSidePane.module.css';

function RightSidePane({children}) {
  return children && (
    <div className={css.pane}>
      {children}
    </div>
  );
}

export default RightSidePane;
