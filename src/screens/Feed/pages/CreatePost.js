import React from 'react';
import PropTypes from 'prop-types';
import { KeyboardAvoidingView, View } from 'react-native';
import { connect } from 'react-redux';
import { Kitsu } from 'kitsu/config/api';
import { defaultAvatar } from 'kitsu/constants/app';
import * as colors from 'kitsu/constants/colors';
import { PostMeta } from 'kitsu/screens/Feed/components/PostMeta';
import { PostTextInput } from 'kitsu/screens/Feed/components/PostTextInput';
import { HeaderButton } from 'kitsu/screens/Feed/components/HeaderButton';
import { PickerModal } from 'kitsu/screens/Feed/components/PickerModal';
import { feedStreams } from '../feedStreams';

class CreatePost extends React.PureComponent {
  static propTypes = {
    currentUser: PropTypes.object.isRequired,
    navigation: PropTypes.object.isRequired,
  }

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;

    return {
      title: 'Create Post',
      headerLeft: <HeaderButton onPress={() => navigation.goBack()} title="Cancel" />,
      headerRight: <HeaderButton highlighted onPress={params.handlePressPost} title="Post" />,
    };
  };

  state = {
    feedPickerModalIsVisible: false,
    content: '',
    currentFeed: feedStreams[0],
  };

  componentDidMount() {
    this.props.navigation.setParams({
      handlePressPost: this.handlePressPost,
    });
  }

  handleFeedPicker = (currentFeed) => {
    this.setState({ currentFeed });
    this.postTextInput.focus();
    this.handleFeedPickerModal(false);
  }

  handleFeedPickerModal = (feedPickerModalIsVisible) => {
    this.setState({ feedPickerModalIsVisible });
  }

  handlePressPost = async () => {
    const currentUserId = this.props.currentUser.id;
    const { content, currentFeed } = this.state;
    // Target interest is either 'anime', 'manga', or blank depending
    // on the feed we want to post to.
    const targetInterest = currentFeed.key !== 'follower' ? currentFeed.key : undefined;

    try {
      await Kitsu.create('posts', {
        content,
        targetInterest,
        user: {
          id: currentUserId,
        },
      });
    } catch (err) {
      console.error(err);
    }

    this.props.navigation.goBack();
  };

  render() {
    const { currentUser } = this.props;

    return (
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      >
        <View style={{ flex: 1 }}>
          <PostMeta
            avatar={currentUser.avatar || defaultAvatar}
            author={currentUser.name}
            feedTitle={this.state.currentFeed.title}
            onFeedPillPress={() => this.handleFeedPickerModal(true)}
          />
          <PostTextInput
            inputRef={(el) => { this.postTextInput = el; }}
            multiline
            numberOfLines={4}
            onChangeText={content => this.setState({ content })}
            value={this.state.content}
            placeholder="Write something...."
            placeholderTextColor={colors.grey}
            autoCorrect={false}
            autoFocus
            returnKeyType="done"
          />
        </View>
        <PickerModal
          visible={this.state.feedPickerModalIsVisible}
          data={feedStreams}
          currentPick={this.state.currentFeed}
          onCancelPress={() => this.handleFeedPickerModal(false)}
          onDonePress={feed => this.handleFeedPicker(feed)}
        />
      </KeyboardAvoidingView>
    );
  }
}

const mapStateToProps = ({ user }) => {
  const { currentUser } = user;
  return { currentUser };
};

export default connect(mapStateToProps)(CreatePost);
