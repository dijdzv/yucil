import { ListItem, ListItemButton, ListItemIcon, ListItemText, Box } from '@mui/material';
import { Inbox as InboxIcon, Drafts as DraftsIcon } from '@mui/icons-material';

export default function Item(props: any) {
  const { provided, innerRef, name, isDragging } = props;

  return (
    <div ref={innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
      <ListItem disablePadding sx={{ bgcolor: isDragging ? '#4d4d4d' : '#121212' }}>
        <ListItemButton>
          <ListItemIcon>
            <InboxIcon />
          </ListItemIcon>
          <ListItemText primary={name} />
        </ListItemButton>
      </ListItem>
      {/* <Box draggable={false} sx={{ height: '3rem' }} /> */}
    </div>
  );
}
