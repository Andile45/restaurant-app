import {Pressable , Text,StyleSheet,View,ViewStyle,ActivityIndicator} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../theme/colors'

interface ButtonProps{
    title:string;
    onPress: ()=>void | Promise<void>;
    variant?:'primary' | 'secondary';
    style?:ViewStyle;
    disabled?:boolean;
    loading?:boolean;
    rightIcon?: keyof typeof Ionicons.glyphMap;
}

export const CustomButton = ({title,onPress,variant='primary',style,disabled=false,loading=false,rightIcon}:ButtonProps)=>{
   const isPrimary = variant === 'primary';
   const isDisabled = disabled || loading;
    return(
        <Pressable
        onPress={isDisabled ? undefined : onPress}
        disabled={isDisabled}
        style={({pressed})=>[
        styles.button,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        pressed && !isDisabled && {opacity:0.7, transform:[{scale:0.98}]},
        isDisabled && {opacity:0.5},
        style
        ]}
        >
        <View style={styles.content}>
          {loading && (
            <ActivityIndicator 
              size="small" 
              color={isPrimary ? colors.textInverse : colors.textSecondary}
              style={styles.loader}
            />
          )}
          <Text style={[
            styles.text,
            isPrimary? styles.primaryText : styles.secondaryText
          ]}>
            {title}
          </Text>
          {!loading && rightIcon && (
            <Ionicons 
              name={rightIcon} 
              size={20} 
              color={isPrimary ? colors.textInverse : colors.textSecondary}
              style={styles.rightIcon}
            />
          )}
        </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button:{
       paddingVertical:14,
       borderRadius:25,
       alignItems:"center",
       justifyContent:'center',
       width:'100%',
       marginVertical:4,
    },
    primaryButton:{
      backgroundColor:colors.primary,
    },
    secondaryButton:{
     backgroundColor:colors.background,
     borderWidth:1,
     borderColor:colors.border,
    },
    content:{
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'center',
    },
    loader:{
      marginRight:8,
    },
    text:{
      fontWeight:'600',
      fontSize:16,
    },
    primaryText:{
     color:colors.textInverse,
    },
    secondaryText:{
       color:colors.textSecondary,
       fontWeight:'500',
    },
    rightIcon:{
      marginLeft:8,
    }
})