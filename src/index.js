import React from "react";
import {
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
  StyleSheet,
  StatusBar,
} from "@react-easy-ui/core-components";

const STATUS_BAR_HEIGHT = StatusBar.currentHeight;

class ModalButton extends React.Component {
  state = { visible: false };
  showModal = () => {
    this.setState({ visible: true });
  };
  hideModal = () => {
    this.setState({ visible: false });
  };
  _updatePosition = (callback) => {
    if (this.modalRef && this.modalRef.measure) {
      this.modalRef.measure((fx, fy, width, height, px, py) => {
        this.modalRefFrame = { x: px, y: py, w: width, h: height };
        callback && callback();
      });
    }
  };

  _calcPosition(callback) {
    let { dropdownStyle, style, adjustFrame, position } = this.props;
    const { keyboardHeight } = this.state;
    const dimensions = Dimensions.get("window");
    const windowWidth = dimensions.width;
    let windowHeight = dimensions.height;
    if (keyboardHeight) {
      windowHeight -= keyboardHeight;
    }
    if (dropdownStyle) {
      dropdownStyle = StyleSheet.flatten(dropdownStyle);
    }
    if (style) {
      style = StyleSheet.flatten(style);
    }
    let marginBottom =
      (dropdownStyle && dropdownStyle.marginBottom) ||
      (style && style.marginBottom) ||
      0;
    if (!marginBottom) {
      marginBottom =
        (dropdownStyle && dropdownStyle.margin) || (style && style.margin) || 0;
    }
    let marginTop =
      (dropdownStyle && dropdownStyle.marginTop) ||
      (style && style.marginTop) ||
      0;
    if (!marginTop) {
      marginTop =
        (dropdownStyle && dropdownStyle.margin) || (style && style.margin) || 0;
    }
    let topBottomMargin = marginTop + marginBottom;

    const dropdownHeight = (dropdownStyle && dropdownStyle.height) || 0;
    //check whether modal should open in top or bottom
    let availableBottomSpace =
      windowHeight -
      this.modalRefFrame.y -
      this.modalRefFrame.h -
      STATUS_BAR_HEIGHT;
    let availabelTopSpace =
      this.modalRefFrame.y - STATUS_BAR_HEIGHT - topBottomMargin;

    let showInBottom =
      dropdownHeight <= availableBottomSpace ||
      availableBottomSpace >= availabelTopSpace;
    if (
      showInBottom &&
      position === "top" &&
      dropdownHeight &&
      dropdownHeight <= availabelTopSpace
    ) {
      showInBottom = false;
    }

    let modalHeight = 0;
    let modalTopPosition = 0;
    let modalBottomPosition = 0;
    //here we decide the modal height and modal top position
    if (showInBottom) {
      modalHeight =
        dropdownHeight <= availableBottomSpace
          ? dropdownHeight
          : availableBottomSpace;
      modalTopPosition =
        this.modalRefFrame.y +
        this.modalRefFrame.h -
        (Platform.OS === "ios" ? STATUS_BAR_HEIGHT : 0);
    } else {
      //check if  space is sufficient for default given height or not
      modalHeight =
        dropdownHeight <= availabelTopSpace
          ? dropdownHeight
          : availabelTopSpace;
      modalBottomPosition =
        windowHeight - STATUS_BAR_HEIGHT - this.modalRefFrame.y;
    }
    const dropdownWidth =
      (dropdownStyle && dropdownStyle.width) ||
      (style && style.width) ||
      this.modalRefFrame.w;
    const positionStyle = {
      position: "absolute",
    };

    positionStyle.width = dropdownWidth;
    if (modalHeight !== undefined) {
      positionStyle.height = modalHeight;
    }
    if (modalTopPosition) {
      positionStyle.top = modalTopPosition;
    }
    if (modalBottomPosition) {
      positionStyle.bottom = modalBottomPosition;
    }

    const rightSpace = windowWidth - this.modalRefFrame.x;
    let showInRight = rightSpace >= dropdownWidth;
    if (
      showInRight &&
      position === "left" &&
      dropdownWidth < this.modalRefFrame.x
    ) {
      showInRight = false;
    }

    if (showInRight) {
      positionStyle.left = this.modalRefFrame.x;
    } else {
      const dropdownWidth =
        (dropdownStyle && dropdownStyle.width) || (style && style.width) || -1;
      if (dropdownWidth !== -1) {
        positionStyle.width = dropdownWidth;
      }
      positionStyle.right = rightSpace - this.modalRefFrame.w;
    }

    // console.warn('position style', positionStyle);
    this.frameStyle = adjustFrame
      ? adjustFrame(positionStyle, this.state)
      : positionStyle;
    if (typeof callback === "function") {
      callback();
    }
    return this.frameStyle;
  }

  afterButtonPress = () => {
    this._calcPosition(this.showModal);
  };

  onButtonPress = () => {
    // this._updatePosition(this.afterButtonPress);
    this._updatePosition(this.showModal);
  };
  componentDidMount() {
    this._updatePosition();
  }

  getStyles = () => {
    const { noBackdrop, backdropColor, position } = this.props;
    let backDropAddOnStyle = void 0;
    let frameStyle = {};
    if (position === "fullScreen") {
      frameStyle.width = "100%";
      frameStyle.height = "100%";
    } else if (position === "screenTop") {
      backDropAddOnStyle = {
        justifyContent: "flex-start",
      };
      frameStyle.width = "100%";
    } else if (position === "screenBottom") {
      backDropAddOnStyle = {
        justifyContent: "flex-end",
      };
      frameStyle.width = "100%";
    } else if (position === "screenLeft") {
      backDropAddOnStyle = {
        alignItems: "flex-start",
      };
      frameStyle.height = "100%";
    } else if (position === "screenRight") {
      backDropAddOnStyle = {
        alignItems: "flex-end",
      };
      frameStyle.height = "100%";
    } else if (position === "screenCenter") {
      backDropAddOnStyle = {
        justifyContent: "center",
        alignItems: "center",
      };
    } else {
      frameStyle = this._calcPosition();
    }

    if (noBackdrop) {
      backDropAddOnStyle.backgroundColor = "transparent";
    } else if (backdropColor) {
      backDropAddOnStyle.backgroundColor = backdropColor;
    }

    return { frameStyle, backDropAddOnStyle };
  };

  render() {
    const { renderModal, style, backdropStyle, autoHide } = this.props;
    let frameStyle = {};
    let backDropAddOnStyle = {};
    const { visible } = this.state;
    if (visible) {
      const {
        frameStyle: updatedFrameStyle,
        backDropAddOnStyle: updatedBackDropAddOnStyle,
      } = this.getStyles();
      frameStyle = updatedFrameStyle;
      console.log("@@style!!>>", frameStyle);
      backDropAddOnStyle = updatedBackDropAddOnStyle;
    }
    return (
      <TouchableOpacity
        ref={(e) => {
          this.modalRef = e;
        }}
        onPress={this.onButtonPress}
        style={style}
      >
        <Modal transparent onRequestClose={this.hideModal} visible={visible}>
          <TouchableOpacity
            onPress={autoHide && this.hideModal}
            activeOpacity={1}
            style={{ ...backdropStyle, ...backDropAddOnStyle, flex: 1 }}
          >
            {typeof renderModal === "function"
              ? renderModal({
                  hideModal: this.hideModal,
                  frameStyle,
                })
              : void 0}
          </TouchableOpacity>
        </Modal>
      </TouchableOpacity>
    );
  }
}

export { ModalButton };
