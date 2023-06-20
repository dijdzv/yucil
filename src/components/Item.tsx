import { ListItem, ListItemButton, CardMedia, ListItemText } from '@mui/material';

export default function Item(props: any) {
  const { provided, innerRef, name, thumbnail, channel, position, playlistId, isDragging } = props;

  return (
    <div ref={innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
      <ListItem
        disablePadding
        sx={{ bgcolor: isDragging ? '#4d4d4d' : '#121212', outline: 'solid 1px rgba(255, 255, 255, 0.12)' }}
      >
        <ListItemButton sx={{ p: 0 }}>
          <CardMedia image={thumbnail} sx={{ minWidth: 60, minHeight: 45, mr: 1 }} />
          <ListItemText
            primary={name}
            primaryTypographyProps={{ overflow: 'hidden', noWrap: true, fontSize: '0.9rem' }}
            secondary={channel}
            secondaryTypographyProps={{ overflow: 'hidden', noWrap: true, fontSize: '0.65rem' }}
          />
        </ListItemButton>
      </ListItem>
    </div>
  );
}
