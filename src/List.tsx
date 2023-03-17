import { Box, List as MuiList, Card, CardContent, ListSubheader, Divider } from '@mui/material';
import {
  Droppable,
  Draggable,
  type DraggableProvided,
  type DraggableStateSnapshot,
  type DraggableRubric,
} from 'react-beautiful-dnd';
import Item from './Item';
import { Playlist, PlaylistItems } from './Dashboard';

const getRenderItem =
  (items: PlaylistItems) => (provided: DraggableProvided, snapshot: DraggableStateSnapshot, rubric: DraggableRubric) =>
    (
      <Item
        innerRef={provided.innerRef}
        provided={provided}
        name={items[rubric.source.index].title}
        isDragging={snapshot.isDragging}
      />
    );

export default function List(props: any) {
  const playlist: Playlist = props.playlist;
  const index: number = props.index;

  const renderItem = getRenderItem(playlist.items);

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 1, height: '100%' }}>
        <MuiList subheader={<ListSubheader>{playlist.name}</ListSubheader>} sx={{ height: '100%' }}>
          <Droppable droppableId={index.toString()} renderClone={renderItem} mode="virtual">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} style={{ height: '100%' }}>
                {playlist.items.map((item, index) => (
                  <Box sx={{ height: '3rem' }} key={index + item.url}>
                    <Divider />
                    <Draggable draggableId={index + item.url} index={index} key={index + item.url}>
                      {renderItem}
                    </Draggable>
                    <Divider />
                  </Box>
                ))}
              </div>
            )}
          </Droppable>
        </MuiList>
      </CardContent>
    </Card>
  );
}
