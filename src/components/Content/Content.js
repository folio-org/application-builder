import css from './Content.module.css';

function Content({children}) {
  return (
    <div className={css.content}>
      {children}
    </div>
  );
}

export default Content;
