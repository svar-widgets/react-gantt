import { Combo } from '@svar-ui/react-core';
import AvatarCell from './AvatarCell.jsx';

function UsersCustomCombo(props) {
  const { value, options, onChange } = props;

  return (
    <Combo
      options={options}
      value={value}
      onChange={onChange}
      clear
      placeholder="Assign to the person"
    >
      {({ option }) => <AvatarCell user={option} />}
    </Combo>
  );
}

export default UsersCustomCombo;
