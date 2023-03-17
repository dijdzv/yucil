import React from 'react';
import { Box, List as MuiList, Card, CardContent, ListSubheader, Divider } from '@mui/material';
import {
  Droppable,
  Draggable,
  type DraggableProvided,
  type DraggableStateSnapshot,
  type DraggableRubric,
} from 'react-beautiful-dnd';
import { FixedSizeList, areEqual } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
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

type RowProps = {
  data: Playlist;
  index: number;
  style: Object;
};

const Row = React.memo(({ data: playlist, index, style }: RowProps) => {
  const item = playlist.items[index];
  const renderItem = getRenderItem(playlist.items);

  return (
    <Box sx={style} key={index + item.url}>
      <Draggable draggableId={index + item.url} index={index} key={index + item.url}>
        {renderItem}
      </Draggable>
    </Box>
  );
}, areEqual);

export default function List(props: any) {
  const playlist: Playlist = props.playlist;
  const index: number = props.index;

  const renderItem = getRenderItem(playlist.items);

  return (
    <Card variant="outlined" sx={{ height: '100%', width: 200 }}>
      <CardContent sx={{ p: 1, height: '100%' }}>
        <MuiList subheader={<ListSubheader>{playlist.name}</ListSubheader>} sx={{ height: '100%' }}>
          <Divider />
          <Droppable droppableId={index.toString()} renderClone={renderItem} mode="virtual">
            {(provided) => (
              <AutoSizer>
                {({ height, width }) => (
                  <FixedSizeList
                    height={height}
                    itemCount={playlist.items.length}
                    itemSize={48}
                    width={width}
                    outerRef={provided.innerRef}
                    itemData={playlist}
                  >
                    {Row}
                  </FixedSizeList>
                )}
              </AutoSizer>
            )}
          </Droppable>
        </MuiList>
      </CardContent>
    </Card>
  );
}
