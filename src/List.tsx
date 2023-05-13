import React, { Dispatch, SetStateAction } from 'react';
import { Box, List as MuiList, Card, CardContent, ListSubheader } from '@mui/material';
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
import { BASE_PLAYLIST_URL, Playlist, PlaylistItem } from './Dashboard';

const getRenderItem =
  (items: PlaylistItem[]) => (provided: DraggableProvided, snapshot: DraggableStateSnapshot, rubric: DraggableRubric) =>
    (
      <Item
        innerRef={provided.innerRef}
        provided={provided}
        name={items[rubric.source.index].title}
        thumbnail={items[rubric.source.index].thumbnail}
        channel={items[rubric.source.index].channel}
        position={items[rubric.source.index].position}
        playlistId={items[rubric.source.index].playlistId}
        isDragging={snapshot.isDragging}
      />
    );

interface RowProps {
  data: {
    playlist: Playlist;
    ref: any;
    intervalRef: any;
  };
  index: number;
  style: Object;
}

const Row = React.memo(({ data: { playlist, ref, intervalRef }, index, style }: RowProps) => {
  const playlistItem = playlist.items[index];
  const renderItem = getRenderItem(playlist.items);

  return (
    <Box
      sx={style}
      key={index + playlistItem.id}
      onClick={() => {
        clearInterval(intervalRef.current);
      }}
    >
      <Draggable draggableId={index + playlistItem.id} index={index} key={index + playlistItem.id}>
        {renderItem}
      </Draggable>
    </Box>
  );
}, areEqual);

export default function List(props: any) {
  const playlist: Playlist = props.playlist;
  const index: number = props.index;
  const setUrl: Dispatch<SetStateAction<string>> = props.setUrl;
  const { ref, intervalRef } = props;

  const renderItem = getRenderItem(playlist.items);

  return (
    <Card variant="outlined" sx={{ height: '100%', width: 200 }}>
      <CardContent sx={{ p: 1, height: '100%' }}>
        <MuiList
          subheader={
            <ListSubheader
              onClick={() => {
                setUrl('');
                clearInterval(intervalRef.current);
                setTimeout(() => {
                  setUrl(BASE_PLAYLIST_URL + playlist.id);
                }, 350);
              }}
              sx={{ borderBottom: 'solid 1px rgba(255, 255, 255, 0.12)' }}
            >
              {playlist.title}
            </ListSubheader>
          }
          sx={{ height: '100%' }}
        >
          <Droppable droppableId={index.toString()} renderClone={renderItem} mode="virtual">
            {(provided) => (
              <AutoSizer>
                {({ height, width }) => (
                  <FixedSizeList
                    height={height}
                    itemCount={playlist.items.length}
                    itemSize={48.48}
                    width={width}
                    outerRef={provided.innerRef}
                    itemData={{ playlist, ref, intervalRef }}
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
