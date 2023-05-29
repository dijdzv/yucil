import React from 'react';
import { Box, List as MuiList, Card, CardContent, ListSubheader, Button } from '@mui/material';
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
import { Playlist, PlaylistItem, Playlists } from './Dashboard';

const getRenderItem =
  (items: PlaylistItem[]) =>
  (provided: DraggableProvided, snapshot: DraggableStateSnapshot, rubric: DraggableRubric) => {
    const item = items[rubric.source.index];

    return (
      <Item
        innerRef={provided.innerRef}
        provided={provided}
        name={item.title}
        thumbnail={item.thumbnail}
        channel={item.channelTitle}
        position={item.position}
        playlistId={item.playlistId}
        isDragging={snapshot.isDragging}
      />
    );
  };

type RowProps = {
  data: {
    playlists: Playlists;
    playlistsItem: Playlist;
    handlePlaylistAt: (newPlaylist: Playlist, index: number) => void;
  };
  index: number;
  style: Object;
};

const Row = React.memo(({ data: { playlists, playlistsItem, handlePlaylistAt }, index, style }: RowProps) => {
  const playlistItem = playlistsItem.items[index];
  const renderItem = getRenderItem(playlistsItem.items);

  return (
    <Box
      sx={style}
      className={playlists.isPlayingPosition(playlistItem.id, index) ? 'yucil-2' : ''}
      key={index + playlistItem.id}
      onClick={() => handlePlaylistAt(playlistsItem, index)}
    >
      <Draggable draggableId={playlistItem.id} index={index} key={playlistItem.id}>
        {renderItem}
      </Draggable>
    </Box>
  );
}, areEqual);

type ListProps = {
  playlists: Playlists;
  playlistsItem: Playlist;
  index: number;
  handlePlaylist: (newPlaylist: Playlist) => void;
  handlePlaylistAt: (newPlaylist: Playlist, index: number) => void;
};

export default function List(props: ListProps) {
  const { playlists, playlistsItem, index, handlePlaylist, handlePlaylistAt } = props;
  const renderItem = getRenderItem(playlistsItem.items);

  return (
    <Card variant="outlined" sx={{ minHeight: '17rem', maxHeight: '100%', width: '25%' }}>
      <CardContent sx={{ p: 1, height: '100%', pb: '8px !important' }}>
        <MuiList
          subheader={
            <ListSubheader
              onClick={() => handlePlaylist(playlistsItem)}
              sx={{ borderBottom: 'solid 1px rgba(255, 255, 255, 0.12)' }}
              className={playlists.isPlayingPlaylist(playlistsItem.id) ? 'yucil-1' : ''}
            >
              <Button color="inherit" fullWidth={true} sx={{ justifyContent: 'left' }}>
                {playlistsItem.title}
              </Button>
            </ListSubheader>
          }
          sx={{ height: '100%', pb: 0 }}
        >
          <Box sx={{ height: 'calc(100% - 45px)' }}>
            <Droppable droppableId={playlistsItem?.id} renderClone={renderItem} mode="virtual">
              {(provided) => (
                <AutoSizer>
                  {({ height, width }) => (
                    <FixedSizeList
                      height={height ?? 0}
                      itemCount={playlistsItem.items.length}
                      itemSize={48.48}
                      width={width ?? 0}
                      outerRef={provided.innerRef}
                      itemData={{ playlists, playlistsItem, handlePlaylistAt }}
                    >
                      {Row}
                    </FixedSizeList>
                  )}
                </AutoSizer>
              )}
            </Droppable>
          </Box>
        </MuiList>
      </CardContent>
    </Card>
  );
}
