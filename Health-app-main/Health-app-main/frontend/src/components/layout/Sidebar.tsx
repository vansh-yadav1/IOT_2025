import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';

const Sidebar = () => {
  const { user } = useAuth();
  const isDoctor = user?.user_metadata?.role === 'DOCTOR';

  return (
    <List>
      {/* No Reports item here */}
    </List>
  );
};

export default Sidebar;

export {}; 