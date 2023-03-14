import { useState } from 'react';
import { Box, List as MuiList, ListSubheader, Divider } from '@mui/material';
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

const getRenderItem =
  (list: Array<any>) =>
  (
    provided: DraggableProvided,
    snapshot: DraggableStateSnapshot,
    rubric: DraggableRubric
  ) =>
    (
      <Item
        innerRef={provided.innerRef}
        provided={provided}
        name={list[rubric.source.index].name}
        isDragging={snapshot.isDragging}
      />
    );

function List(props: any) {
  const { listName, len } = props;

  const initialList = [];
  for (let i = 0; i < 5; i++) {
    const now = new Date().getTime();
    initialList.push({
      name: 'item' + (i + 1),
      uid: now + i,
      order: i,
    });
  }

  const [list, setList] = useState(initialList);

  const renderItem = getRenderItem(list);

  const reorder = (startIndex: number, endIndex: number) => {
    const result = list;
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    // result.map((item, index) => (item.order = index));
    return result;
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) {
      return;
    }
    // if (
    //   destination.droppableId === source.droppableId &&
    //   destination.index === source.index
    // ) {
    //   return;
    // }
    const update = reorder(source.index, destination.index);
    setList(update);
  };

  return (
    <MuiList
      sx={{
        width: '100%',
        maxWidth: `${100 / (len + 1)}%`,
        height: '100%',
        bgcolor: 'background.paper',
      }}
      subheader={<ListSubheader>{listName}</ListSubheader>}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable
          droppableId="musicList"
          renderClone={renderItem}
          mode="virtual"
        >
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {list.map((item, index) => (
                <Box sx={{ height: '3rem' }} key={item.uid}>
                  <Divider />
                  <Draggable
                    draggableId={item.uid.toString(16)}
                    index={index}
                    key={item.uid}
                  >
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
  );
}

export default function Lists() {
  const playlist = ['list-1', 'list-2', 'list-3'];

  return (
    <Box
      sx={{ display: 'flex', justifyContent: 'space-evenly', height: '90%' }}
    >
      {playlist.map((listName, _, array) => (
        <List listName={listName} len={array.length} key={listName} />
      ))}
    </Box>
  );
}
