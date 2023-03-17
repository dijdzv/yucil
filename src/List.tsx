import { Box, List as MuiList, Card, CardContent, ListSubheader, Divider } from '@mui/material';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
  type DraggableProvided,
  type DraggableStateSnapshot,
  type DraggableRubric,
} from 'react-beautiful-dnd';
import Item from './Item';
import { Playlist, PlaylistItems } from './Dashboard';
import { Dispatch, SetStateAction } from 'react';

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
  const setPlaylists: Dispatch<SetStateAction<Array<Playlist>>> = props.setPlaylists;
  const index = props.index;

  const renderItem = getRenderItem(playlist.items);

  const reorder = (startIndex: number, endIndex: number) => {
    const result = playlist;
    const [removed] = result.items.splice(startIndex, 1);
    result.items.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // ドロップ先が存在しない場合は終了
    if (!destination) {
      return;
    }
    // 同じ位置に移動した場合は終了
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const update = reorder(source.index, destination.index);
    setPlaylists((prev) => {
      prev[index] = update;
      return prev;
    });
  };

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 1 }}>
        <MuiList subheader={<ListSubheader>{playlist.name}</ListSubheader>}>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="musicList" renderClone={renderItem} mode="virtual">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
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
          </DragDropContext>
        </MuiList>
      </CardContent>
    </Card>
  );
}
