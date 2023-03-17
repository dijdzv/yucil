import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Inbox as InboxIcon } from '@mui/icons-material';

export default function Item(props: any) {
  const { provided, innerRef, name, isDragging } = props;

  return (
    <div ref={innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
      <ListItem
        disablePadding
        sx={{ bgcolor: isDragging ? '#4d4d4d' : '#121212', outline: 'solid 1px rgba(255, 255, 255, 0.12)' }}
      >
        <ListItemButton>
          <ListItemIcon>
            <InboxIcon />
          </ListItemIcon>
          <ListItemText primary={name} />
        </ListItemButton>
      </ListItem>
    </div>
  );
}
