import './index.scss';

export const ButtonSecondary = ({
  mode,
  onClick,
  className,
  isDisabled,
}: {
  mode: string;
  onClick: () => void;
  className?: string;
  isDisabled?: boolean;
}) => {
  return (
    <button
      onClick={onClick}
      className={`buttonSecondary buttonSecondary_${mode} ${
        className ? className : ''
      } ${isDisabled ? 'disabled' : ''} `}
    />
  );
};
