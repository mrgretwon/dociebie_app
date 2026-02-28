from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "name", "surname", "street", "city", "postal_code", "role")
        read_only_fields = ("id", "role")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(
        choices=User.Role.choices, default=User.Role.CLIENT, required=False
    )

    class Meta:
        model = User
        fields = ("email", "password", "name", "surname", "street", "city", "postal_code", "role")

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class ProfileUpdateSerializer(serializers.ModelSerializer):
    new_password = serializers.CharField(write_only=True, required=False, min_length=6)

    class Meta:
        model = User
        fields = ("name", "surname", "email", "street", "city", "postal_code", "new_password")
        extra_kwargs = {
            "name": {"required": False},
            "surname": {"required": False},
            "email": {"required": False},
            "street": {"required": False},
            "city": {"required": False},
            "postal_code": {"required": False},
        }

    def update(self, instance, validated_data):
        new_password = validated_data.pop("new_password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if new_password:
            instance.set_password(new_password)
        instance.save()
        return instance


def get_tokens_for_user(user) -> dict:
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }
