import './index.scss';

const ButtonPrimaryTexts: { [key: string]: string } = {
  add: 'Добавить',
  play: 'Играть',
  download: 'Скачать',
  rulesBook: 'Книга Правил',
};

export const ButtonPrimary = ({
  mode,
  onClick,
  className,
}: {
  mode: string;
  className?: string;
  onClick: () => void;
}) => {
  return (
    <div className={`buttonPrimaryWrapper ${className ? className : ''}`}>
      <button
        onClick={onClick}
        className={`buttonPrimary buttonPrimary_${mode}`}
      />

      <span className="buttonPrimary__text">{ButtonPrimaryTexts[mode]}</span>
    </div>
  );
};
